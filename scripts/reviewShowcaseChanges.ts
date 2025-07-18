#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface GoogleDocsProject {
  project: string;
  cohort: string;
  link: string;
  description: string;
  image_url: string;
}

type ValidCohort = 'SEC-00' | 'SEC-01' | 'SEC-02' | 'SEC-03' | 'SEC-04';

interface ShowcaseProject {
  name: string;
  description: string;
  cohort: string;
  link: string;
  linkText: string;
  logo: string;
  highlight: boolean;
  extraLinks?: { link: string; linkText: string; }[];
}

interface ProposedChange {
  id: string;
  projectName: string;
  changeType: 'description' | 'image' | 'link' | 'new_project';
  currentValue: string;
  proposedValue: string;
  reason: string;
  approved?: boolean;
}

// Normalize cohort format from Google Docs to standard SEC-XX format
function normalizeCohort(cohort: string): ValidCohort {
  // Extract SEC-XX pattern from strings like "SEC-01: Jan-Mar 2024"
  const match = cohort.match(/SEC-(\d+)/);
  if (match) {
    const number = match[1].padStart(2, '0'); // Ensure 2-digit format
    return `SEC-${number}` as ValidCohort;
  }
  
  // Default fallback
  console.warn(`Warning: Could not parse cohort "${cohort}", defaulting to SEC-04`);
  return 'SEC-04';
}

// Clean and parse the Google Docs JSON data
function cleanGoogleDocsData(): GoogleDocsProject[] {
  const rawData = readFileSync('google_docs_projects_update.json.md', 'utf8');
  
  // Remove the markdown code block markers
  const jsonContent = rawData.replace(/```json\n?/, '').replace(/\n?```$/, '');
  
  // Helper function to extract first valid URL from complex image_url strings
  function extractFirstValidUrl(urlString: string): string {
    if (!urlString) return '';
    
    // Remove citation markers
    let cleaned = urlString.replace(/\s*\[cite:\s*\d+\]\s*/g, '').trim();
    
    // Extract URLs from various patterns - stop at common delimiters
    const urlRegex = /https:\/\/[^\s"]*?(?=\s|"|$|Light:|Dark:|Vector:|Logo:|Badge:|App Icon:|Original logo:)/g;
    const urls = cleaned.match(urlRegex);
    
    if (urls && urls.length > 0) {
      // Return the first URL found, cleaned up
      return urls[0].replace(/[,\s]*$/, ''); // Remove trailing commas/spaces
    }
    
    return '';
  }

  // Clean up the malformed JSON
  let cleanedContent = jsonContent
    // Remove [cite_start] markers first
    .replace(/\[cite_start\]/g, '')
    // Remove citation references like [cite: 13]
    .replace(/\s*\[cite:\s*\d+\]\s*/g, '')
    // Remove trailing commas before closing braces
    .replace(/,(\s*[}\]])/g, '$1');

  // Fix complex image_url fields by extracting the first valid URL
  cleanedContent = cleanedContent.replace(
    /"image_url":\s*"([^"]+)"/g,
    (match, urlString) => {
      const cleanUrl = extractFirstValidUrl(urlString);
      return `"image_url": "${cleanUrl}"`;
    }
  );
  
  try {
    const parsed = JSON.parse(cleanedContent);
    const filtered = parsed.filter((project: GoogleDocsProject) => 
      project.project && project.project.trim() !== ''
    );
    
    // Normalize cohort formats
    return filtered.map((project: GoogleDocsProject) => ({
      ...project,
      cohort: normalizeCohort(project.cohort)
    }));
  } catch (error) {
    console.error('Failed to parse cleaned JSON:', error);
    console.log('Cleaned content sample:', cleanedContent.substring(0, 500));
    throw error;
  }
}

// Load current showcase projects
function loadCurrentProjects(): ShowcaseProject[] {
  try {
    const content = readFileSync('src/data/showcaseProjects.json', 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load showcaseProjects.json:', error);
    throw error;
  }
}

// Compare projects and generate proposed changes
function generateProposedChanges(
  currentProjects: ShowcaseProject[],
  googleDocsProjects: GoogleDocsProject[]
): ProposedChange[] {
  const changes: ProposedChange[] = [];
  let changeId = 1;

  for (const gdProject of googleDocsProjects) {
    // Use exact matching to avoid false positives with similar project names
    // This ensures different versions of projects (like "Hypernote" vs "Hypernote.md") are treated separately
    const currentProject = currentProjects.find(p => {
      const pName = p.name.toLowerCase().trim();
      const gdName = gdProject.project.toLowerCase().trim();
      
      // Exact match only
      if (pName === gdName) return true;
      
      // Handle specific known variations that are truly the same project
      if (pName === 'nip-60' && gdName === 'nip-60: nostr-based cashu wallets') return true;
      if (pName === 'shopstr' && gdName === 'shopstr (nip-60/61 integration)') return true;
      
      // Very conservative partial matching for clear aliases only
      if (pName === 'alphaama' && gdName === 'alphaama') return true;
      if (pName === 'confidential computing research' && gdName === 'confidential computing research') return true;
      
      return false;
    });

    if (!currentProject) {
      // New project
      if (gdProject.description || gdProject.image_url || gdProject.link) {
        changes.push({
          id: `change_${changeId++}`,
          projectName: gdProject.project,
          changeType: 'new_project',
          currentValue: 'None',
          proposedValue: JSON.stringify(gdProject, null, 2),
          reason: 'New project found in Google Docs data'
        });
      }
      continue;
    }

    // Check for description changes
    if (gdProject.description && gdProject.description.trim() !== '' && 
        gdProject.description !== currentProject.description) {
      changes.push({
        id: `change_${changeId++}`,
        projectName: gdProject.project,
        changeType: 'description',
        currentValue: currentProject.description,
        proposedValue: gdProject.description,
        reason: 'Description found in Google Docs data'
      });
    }

    // Check for image changes (if current is generic logo OR if current is external URL that should be downloaded)
    const hasGenericLogo = isGenericLogo(currentProject.logo);
    const hasExternalUrl = currentProject.logo && currentProject.logo.startsWith('http');
    const hasNewImageUrl = gdProject.image_url && gdProject.image_url.trim() !== '';
    
    // Only propose change if:
    // 1. Replacing generic logo with custom image, OR
    // 2. External URL is different from current external URL
    // And the proposed URL looks like an image (has image extension or is from known image hosts)
    const isImageUrl = (url: string) => {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
      const imageHosts = ['cdn.satellite.earth', 'blob.satellite.earth', 'nostr.download', 'image.nostr.build', 'm.primal.net'];
      
      return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
             imageHosts.some(host => url.includes(host));
    };
    
    if (hasNewImageUrl && isImageUrl(gdProject.image_url) && hasGenericLogo) {
      changes.push({
        id: `change_${changeId++}`,
        projectName: gdProject.project,
        changeType: 'image',
        currentValue: currentProject.logo,
        proposedValue: gdProject.image_url,
        reason: 'Custom image found to replace generic logo'
      });
    } else if (hasNewImageUrl && isImageUrl(gdProject.image_url) && hasExternalUrl && gdProject.image_url !== currentProject.logo) {
      changes.push({
        id: `change_${changeId++}`,
        projectName: gdProject.project,
        changeType: 'image',
        currentValue: currentProject.logo,
        proposedValue: gdProject.image_url,
        reason: 'Different external image URL found - will download to local folder'
      });
    }

    // Check for link changes (only if current link is empty or github, AND the link is actually different)
    if (gdProject.link && gdProject.link.trim() !== '' && 
        gdProject.link !== currentProject.link &&
        (!currentProject.link || currentProject.link.includes('github.com'))) {
      changes.push({
        id: `change_${changeId++}`,
        projectName: gdProject.project,
        changeType: 'link',
        currentValue: currentProject.link,
        proposedValue: gdProject.link,
        reason: 'Better link found in Google Docs data'
      });
    }
  }

  return changes;
}

// Check if a logo is a generic one
function isGenericLogo(logo: string): boolean {
  const genericLogos = [
    'blossom-logo.png',
    'nostr-logo.png',
    'bitcoin-logo.png',
    'lightning-logo.png'
  ];
  return genericLogos.some(generic => logo.includes(generic));
}

// Extract link text from URL or domain name
function getLinkText(link: string): string {
  if (!link) return '';
  
  try {
    // Try to parse as a full URL first
    const url = new URL(link);
    return url.hostname;
  } catch (error) {
    // If it fails, it might be just a domain name without protocol
    try {
      const url = new URL(`https://${link}`);
      return url.hostname;
    } catch (error2) {
      // If both fail, just return the original link
      return link;
    }
  }
}

// Download image from URL
async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    console.log(`📥 Downloading: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`📦 Received ${response.headers.get('content-length') || 'unknown'} bytes`);
    const buffer = await response.arrayBuffer();
    const imagePath = join('public/images/showcase', filename);
    
    // Ensure directory exists
    mkdirSync('public/images/showcase', { recursive: true });
    
    // Write file and verify it exists
    writeFileSync(imagePath, Buffer.from(buffer));
    
    // Verify file was written successfully
    if (require('fs').existsSync(imagePath)) {
      const stats = require('fs').statSync(imagePath);
      console.log(`✓ Downloaded: ${filename} (${stats.size} bytes)`);
      return true;
    } else {
      throw new Error('File was not written successfully');
    }
  } catch (error) {
    console.error(`✗ Failed to download ${filename}:`, error);
    return false;
  }
}

// Interactive review process
async function reviewChanges(changes: ProposedChange[]): Promise<void> {
  console.log(`\n🔍 Found ${changes.length} proposed changes to review:\n`);
  console.log('Commands: y=approve, n=reject, q=quit, all=approve all remaining changes\n');
  
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    console.log(`\n📋 Change ID: ${change.id} (${i + 1}/${changes.length})`);
    console.log(`📦 Project: ${change.projectName}`);
    console.log(`🔄 Type: ${change.changeType}`);
    console.log(`📝 Reason: ${change.reason}`);
    
    if (change.changeType === 'new_project') {
      console.log(`\n🆕 New Project Data:`);
      console.log(change.proposedValue);
    } else {
      console.log(`\n📊 Current: ${change.currentValue}`);
      console.log(`📊 Proposed: ${change.proposedValue}`);
    }
    
    const response = prompt('\n👍 Approve this change? (y/n/q/all): ');
    
    if (response?.toLowerCase() === 'q') {
      console.log('Exiting review process...');
      break;
    }
    
    if (response?.toLowerCase() === 'all') {
      console.log('🚀 Approving all remaining changes...');
      // Approve current change and all remaining ones
      for (let j = i; j < changes.length; j++) {
        changes[j].approved = true;
        console.log(`✅ Auto-approved: ${changes[j].projectName} (${changes[j].changeType})`);
      }
      break;
    }
    
    change.approved = response?.toLowerCase() === 'y';
    
    if (change.approved) {
      console.log('✅ Approved');
      
      // If it's an image change, download the image
      if (change.changeType === 'image') {
        try {
          const url = change.proposedValue;
          const filename = `${change.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo.${url.split('.').pop()}`;
          const downloadSuccess = await downloadImage(url, filename);
          if (downloadSuccess) {
            // Update the proposed value to use the local path
            change.proposedValue = `/images/showcase/${filename}`;
          } else {
            console.log('❌ Failed to download image, skipping this change');
            change.approved = false;
          }
        } catch (error) {
          console.log('❌ Failed to download image, skipping this change');
          change.approved = false;
        }
      }
    } else {
      console.log('❌ Rejected');
    }
  }
}

// Apply approved changes to showcaseProjects.js
function applyApprovedChanges(
  currentProjects: ShowcaseProject[],
  approvedChanges: ProposedChange[]
): ShowcaseProject[] {
  const updatedProjects = [...currentProjects];
  
  for (const change of approvedChanges.filter(c => c.approved)) {
    if (change.changeType === 'new_project') {
      // Add new project
      const gdProject: GoogleDocsProject = JSON.parse(change.proposedValue);
      const newProject: ShowcaseProject = {
        name: gdProject.project,
        description: gdProject.description || 'Description to be added',
        cohort: gdProject.cohort,
        link: gdProject.link || '',
        linkText: gdProject.link ? getLinkText(gdProject.link) : '',
        logo: '/images/showcase/nostr-logo.png', // Will be updated by image download if approved
        highlight: false
      };
      updatedProjects.push(newProject);
    } else {
      // Update existing project
      const projectIndex = updatedProjects.findIndex(p => 
        p.name.toLowerCase().includes(change.projectName.toLowerCase()) ||
        change.projectName.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (projectIndex !== -1) {
        switch (change.changeType) {
          case 'description':
            updatedProjects[projectIndex].description = change.proposedValue;
            break;
          case 'image':
            updatedProjects[projectIndex].logo = change.proposedValue;
            break;
          case 'link':
            updatedProjects[projectIndex].link = change.proposedValue;
            updatedProjects[projectIndex].linkText = change.proposedValue ? 
              getLinkText(change.proposedValue) : '';
            break;
        }
      }
    }
  }
  
  return updatedProjects;
}

// Save WIP projects to JSON file
function saveWipProjects(projects: ShowcaseProject[]): void {
  try {
    writeFileSync('scripts/wip_new_projects.json', JSON.stringify(projects, null, 2));
    console.log('✅ Saved WIP version to scripts/wip_new_projects.json');
  } catch (error) {
    console.error('❌ Failed to save WIP file:', error);
  }
}

// Save updated projects back to JSON file
function saveUpdatedProjects(projects: ShowcaseProject[]): void {
  try {
    writeFileSync('src/data/showcaseProjects.json', JSON.stringify(projects, null, 2));
    console.log('✅ Updated showcaseProjects.json successfully!');
  } catch (error) {
    console.error('❌ Failed to save showcaseProjects.json:', error);
    console.log('💡 Check scripts/wip_new_projects.json for the updated version');
  }
}

// Main function
async function main() {
  let currentProjects: ShowcaseProject[] = [];
  let googleDocsProjects: GoogleDocsProject[] = [];
  
  try {
    console.log('🚀 Starting showcase projects review process...\n');
    
    // Parse Google Docs data
    console.log('📖 Parsing Google Docs data...');
    try {
      googleDocsProjects = cleanGoogleDocsData();
      console.log(`Found ${googleDocsProjects.length} projects in Google Docs data`);
    } catch (error) {
      console.error('❌ Failed to parse Google Docs data:', error);
      console.log('💡 Please check google_docs_projects_update.json.md for formatting issues');
      return;
    }
    
    // Load current projects
    console.log('📂 Loading current showcase projects...');
    try {
      currentProjects = loadCurrentProjects();
      console.log(`Found ${currentProjects.length} current projects`);
    } catch (error) {
      console.error('❌ Failed to load current projects:', error);
      console.log('💡 Please check src/data/showcaseProjects.json for syntax issues');
      return;
    }
    
    // Generate proposed changes
    console.log('🔍 Analyzing differences...');
    const proposedChanges = generateProposedChanges(currentProjects, googleDocsProjects);
    
    if (proposedChanges.length === 0) {
      console.log('✅ No changes needed! All projects are up to date.');
      // Still save WIP file as "checkmark"
      saveWipProjects(currentProjects);
      return;
    }
    
    // Interactive review
    await reviewChanges(proposedChanges);
    
    // Apply approved changes
    const approvedChanges = proposedChanges.filter(c => c.approved);
    if (approvedChanges.length > 0) {
      console.log(`\n🔄 Applying ${approvedChanges.length} approved changes...`);
      try {
        const updatedProjects = applyApprovedChanges(currentProjects, approvedChanges);
        
        // Always save WIP version first
        saveWipProjects(updatedProjects);
        
        // Then try to save the actual file
        saveUpdatedProjects(updatedProjects);
        
        console.log('\n📊 Summary:');
        console.log(`✅ Applied: ${approvedChanges.length} changes`);
        console.log(`❌ Rejected: ${proposedChanges.length - approvedChanges.length} changes`);
      } catch (error) {
        console.error('❌ Failed to apply changes:', error);
        console.log('💡 WIP file may still contain progress');
      }
    } else {
      console.log('\n📊 No changes were approved.');
      // Still save WIP file as "checkmark"
      saveWipProjects(currentProjects);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    // Try to save whatever we have so far
    if (currentProjects.length > 0) {
      console.log('💾 Attempting to save current state...');
      saveWipProjects(currentProjects);
    }
    
    console.log('\n💡 Tips for debugging:');
    console.log('- Check google_docs_projects_update.json.md for JSON formatting issues');
    console.log('- Check src/data/showcaseProjects.json for syntax errors');
    console.log('- Look for network issues if image downloads are failing');
    console.log('- Check scripts/wip_new_projects.json for partial progress');
  }
}

// Run the script
if (import.meta.main) {
  main();
}