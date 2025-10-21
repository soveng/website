# SEC-05 Summary

## Introduction

SEC-05: YOLO Mode is over and YOLO it was! It was an expedition in vibe coding and vibe we did We concluded our last Demo Day on 10th October, with most participants having more than one demo, and 6 minutes per demo felt less. The spirits were high thanks to Ponchas and LLMs despite their sycophantic hallucinations. The fifth edition saw about 50% alumni and 50% new participants. It was built upon the explorations of SEC-04 to enhance our collective understanding and utilisation of LLMs, as well as the ideas explored across all the SECs. It was also the cohort where we literally memed our ideas to life! Great memes were born during Poncha-fuelled evenings and Sunday walks.

## Main Themes

It is challenging to pinpoint the main theme, as the cohort was highly dynamic and participants came from diverse domains; however, one of the underlying themes was a local-first approach. Most things being built were oriented towards being offline as the default. This also lent into selling/creating markets for locally available resources viz. compute, hardware, maps & even IPs over Nostr and automated purchases of the same by machines using Cashu - Oh! How could we forget, wifi & data too - 🎩🤏 [Tollgate](https://tollgate.me)!

A second major theme was rethinking the entire Internet stack using Nostr keys as identities that can announce, be discovered, and communicate with each other without having a domain, connected to centralised DNS servers, or having certificates from CAs. Audio/Video streaming & MLS was another highlight, combining Nostr with other protocols like [Iroh](https://github.com/n0-computer/iroh) & [MoQ](https://github.com/kixelated/moq). The challenges of doing A/V, the simplicity of Nostr contrasted by the complexity of current browsers, inspired [Justin](https://njump.me/npub1zxu639qym0esxnn7rzrt48wycmfhdu3e5yvzwx7ja3t84zyc2r8qz8cx2y) to rise up to the challenge and build a browser from the ground up, where he channellised his and other participants' collective hatred for WebRTC.

We saw quite a few projects on Maps over Nostr, where we not only overlaid information over Open Street Maps, but also stitched our own maps and served them as blobs. There was an acute need for deeper integration below the application layer of various tools and apps such that they can be easily installed and have a unified experience à la Umbrel, leading to many discussions & projects on local DBs, Wallet UX(NWC/NWA), Blossom, Torrents & local relays.

Two important toolings that were used over and over by various projects were the [Applesauce](https://hzrd149.github.io/applesauce) library and [ContextVM](https://www.contextvm.org/).

Applesauce has matured, is optimised, and very opinionated, which makes it extremely useful. Being functional in nature also allows it to be very reliable. It does take some getting used to, but [hzrd149](https://njump.me/npub1ye5ptcxfyyxl5vjvdjar2ua3f0hynkjzpx552mu5snj3qmx5pzjscpknpr) has published very good [docs](https://hzrd149.github.io/applesauce/), extensive [snippets](https://ants.sh/?q=is%3Acode+by%3Ahzrd149) and live [examples](https://hzrd149.github.io/applesauce/examples/). It's a fantastic library for building applications,10/10 recommended.

ContextVM is the mature version of DVMCP by [Gzuuus](https://njump.me/npub1gzuushllat7pet0ccv9yuhygvc8ldeyhrgxuwg744dn5khnpk3gs3ea5ds). It is a lot more than just a DVM or an MCP server. It is a protocol to communicate with remote services in a structured manner without having to deal with Network configuration, IPs, etc. Irrelevant. What it enables is not just a protocol to communicate with your MCP servers remotely, but to expose ANY services and access them from anywhere if you know its https://njump.me/npub. It was seen being used in many projects and was found to be very easy to work with. Read the [ContextVM docs](https://docs.contextvm.org/) to learn more.

## Highlight Projects by Category

### AI & Local-First Computing
- **[Routstr](https://github.com/orgs/Routstr)** (by [Dom](https://njump.me/npub18gr2m5cflkzpn6jdfer4a8qdlavsn334m9mfhurjsge08grg82zq6hu9su), [Evan](https://njump.me/npub1u37h8rhgm9f95d90lpk2afw8h4t75kf6w8vmga2zz9jsx3atzpuqlmw8vy) & [Red](https://njump.me/npub1ftt05tgku25m2akgvw6v7aqy5ux5mseqcrzy05g26ml43xf74nyqsredsh)) - many updates to Routstr, a protocol to buy and sell LLM compute using Cashu payments over Nostr
- **[OTRTA (Routstr client)](https://github.com/Routstr/otrta-client)** (by [Abdou](https://njump.me/npub1ygjd597hdwu8larprmhj893d5p832j5mhejpx40ukezgudvayg9qeklajc)) - Openrouter over Nostr using Cashu for selling local/API compute in a self-custodial manner
- **[Local++](https://github.com/Routstr/local-plus-plus)** (by Dom) - Mobile app for local LLM models with dynamic online/offline switching using Routstr/OTRTA

### Remote Vibin' Tools
- **[Wingman](https://github.com/humansinstitute/wingman)** (by Pete) - AI Development remote assistant app, which now can use many LLM providers
- **[Opencode UI](https://github.com/justinmoon/opencode-ui)** (by Justin) - Web companion for managing remote opencode instances

### Communication & Social
- **[NEET](https://github.com/justinmoon/neet-native)** (by Justin) - P2P calls via Nostr using Iroh for hole punching
- **[Marmot Chat](https://github.com/justinmoon/av-demo)** (by Justin) - Audio/video calls between Nostr IDs using MLS for E2EE & MoQ for data transfer
- **[Innpub](https://github.com/futurepaul/inhttps://njump.me/npub)** (by [Paul](https://njump.me/npub1p4kg8zxukpym3h20erfa3samj00rm2gt4q5wfuyu3tg0x3jg3gesvncxf8) & Justin) - Location sensitive voice meetup app using MoQ

### Maps & Location
- **[Spotstr](https://github.com/k0sti/spotstr)** (by [Kosti](https://njump.me/npub1zc6ts76lel22d38l9uk7zazsen8yd7dtuzcz5uv8d3vkast9hlks4725sl)) - Maps on Nostr with encrypted group sharing of locations and importing BTCMaps data
- **[Earthly.city](https://earthly.city/)** (by [Schlaus Kwab](https://njump.me/npub182jczunncwe0jn6frpqwq3e0qjws7yqqnc3auccqv9nte2dnd63scjm4rf)) - Maps  stitched, stored, and served as blobs
- **Nostr Globe** (by Evan) - Mapping map overlay data on the globe - very pretty
- **Gather** (by [Noa](https://njump.me/npub1rtcjydw22laa0ymwatlrtv02lgu6q6sez4gvs63d696putzyezqs65qqsd)) - Spontaneous event publishing with temporary postings

### File & Blob Management
- **[BloVM](https://github.com/ContextVM/blovm)** (by Gzuuus) - Blossom server monitor & indexer with blob health checks, also uses ContextVM
- **[Blob Box](https://github.com/hzrd149/umbrel-blob-box)** (by Hzrd149) - simple Blossom server built for UmbrelOS

### Mining - by [vnprc](https://njump.me/npub16vzjeglr653mrmyqvu0trwaq29az753wr9th3hyrm5p63kz2zu8qzumhgd)
- **[hashpool](https://github.com/vnprc/hashpool)** - Improvements on hashpool - mining pools, eHash & Cashu; [dashboard](https://pool.hashpool.dev/), [proxy](https://proxy.hashpool.dev/)
- **[bitcoin-nostr-relay](https://crates.io/crates/bitcoin-nostr-relay)** - A Rust library for relaying Bitcoin transactions over the Nostr

### Cashu NUT Proposals - by vnprc
- [NUT-XX: Deterministic NUT-13 Derivation Paths](https://github.com/cashubtc/nuts/pull/292)
- [NUT-XX: Mining Share Payment Method](https://github.com/cashubtc/nuts/pull/293)

### Networking & Infrastructure
- **[Paygress](https://github.com/DhananjayPurohit/paygress)** (by [DJ](https://njump.me/npub1qnw27f2jsqvn05wzpd56m7ykgmepk57p0yrzw8fzc7lfhjkmjmqqmd9r6h)) - VM provisioning and VPN purchasing over Nostr with Kubernetes integration
- **noPorts** (by [Arjen](https://njump.me/npub1hw6amg8p24ne08c9gdq8hhpqx0t0pwanpae9z25crn7m9uy7yarse465gr)) - NGrok-like service over Nostr with smart reverse proxy
- **[noDNS](https://ants.sh/?q=noDNS+by%3Aarjen)** (by Arjen) - DNS over Nostr
- **FIPs** (by Arjen) - Fuck IPs using bloom filters
- **Chrysalis** (by Noa) - Atomic Cashu mint migration with "traveling server" concept

### Wallets & Payments
- **[noDNS BIP353 & BOLT12](https://github.com/bencoin21/nodns_bip353_bolt12_silentpayment)** (by [Thomas](https://njump.me/npub175aemydge5thld9peuyp5xmdtp6e5wq77ys203dp3s88pjhgpxpsvgkemm)) - BIP353 & BOLT12 payments over noDNS
- **[Nutoff](https://github.com/gzuuus/nutoff-wallet)** (by Gzuuus) - Cashu wallet using ContextVM for remote access
- **[Wally](https://github.com/Origami74/wally)** (by Paul & Arjen) - Desktop native wallet with NWC
- **[Beacon](https://github.com/orgs/beacon21m/repositories)** (by [Pete](https://njump.me/npub1jss47s4fvv6usl7tn6yp5zamv2u60923ncgfea0e6thkza5p7c3q0afmzy)) - AI and Bitcoin stuffed in chat apps, WhatsApp/Signal/Qual uses ContextVM

### Search & Discovery
- **[ants](https://ants.sh/)** (by [Gigi](https://njump.me/npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc)) - Left-side of the curve Nostr search done reasonably well
- **[Boris](https://readwithboris.com)** (by Gigi) - Highlighter fixed and done right - finally!
- **Seekstr** (by Abdou & Kosti) - Semantic multimedia search across Nostr data

### Applesauce & Window.nostrdb.js - by Hzrd149
- **[Window.nostrdb.js](https://github.com/hzrd149/window.nostrdb.js)** - A polyfill for window.nostrdb
- **[Backyard Explorer](https://github.com/hzrd149/backyard-explorer)** - An example search app for window.nostrdb
- **[Nostr Bucket](https://github.com/hzrd149/Nostr-bucket)** - Browser extension that provides a Nostr event cache to all web apps
- **[Nostr Gatekeeper](https://github.com/hzrd149/Nostr-gatekeeper)** - A Nostr connect bunker that actually works

### Memes & Games - by Pete
- **[Retired in a field](https://github.com/humansinstitute/retired_in_a_field)** - solving developer funding and using ContextVM
- **[Craig David](https://github.com/humansinstitute/craigdavid)** - get roasted by Craig David(AI), because no matter what, he's having a better week than you.

### Hyper-media/note/OS/vibe - by Paul
- **[Hypernote](https://github.com/futurepaul/hypernote)** - Main idea of the hypermedia system built on Nostr
- **[Hypernote Stories](https://github.com/futurepaul/hypernote-stories)** - Story feature extension
- **[Hypernote Elements](https://github.com/futurepaul/hypernote-elements)** - UI elements library
- **[Hypernote OS](https://github.com/futurepaul/hypernote-os)** - Hypernote imagined as an operating system

### Zig doing Nostr, finally! - by Paul
- **[Zig MDX](https://github.com/futurepaul/zig-mdx)** - An MDX (Markdown with JSX) tokenizer and parser written in Zig
- **[Zing Nostr Loader](https://github.com/futurepaul/zig-Nostr-loader)** - A WASM-first Nostr event loader built with Zig, designed for high-performance caching and deduplication
- **[Hypernote Pages](https://github.com/futurepaul/hypernote-pages)** - Component-oriented version of Hypernote OS using **zig-mdx and zig-Nostr-loader** for building reactive Nostr applications

### Browser

- **[Frontier Browser](https://github.com/justinmoon/frontier)** (by Justin) - The Web is Dead, Long Live the Web!

## Captain's Logs

Here are the Captains' logs for deeper dive on week by week explorations:

- [Week 1](https://gist.github.com/justinmoon/4363ccf687f418f174fd4a520b268ca0) - Justin
- [Week 2](https://gist.github.com/Origami74/d967dae072f1b75ee61db76eaf1d08d6) - Arjen
- [Week 3](https://gist.github.com/trbouma/9d2db5590efb024f271e31b2a86f0418) - [Tim](https://njump.me/npub1q6mcr8tlr3l4gus3sfnw6772s7zae6hqncmw5wj27ejud5wcxf7q0nx7d5)
- [Week 4 - Detox Week](https://gist.github.com/jodobear/b41b7439ea5bde5008260941d3fd09ef) - [Yo](https://njump.me/npub16c9a45p5dr6l3jzmrvgdh9m7xy994tatxd6sm7kmxaygkq4lertsfnacfm)
- [Week 5](https://gist.github.com/jodobear/04be6e24c9612efcc1bf6157018f11f1) - Yo
- [Week 6](https://gist.github.com/futurepaul/9b8f3096751fcc21f17d52da80c08c68) - Paul

## Memes

We had some great memes!

- don't fuck with spiders
- bum fist
- retired in a field
- sometimes you are the retard, sometimes the cow
- moo money, moo cows
- the ultimate fight is the cow within
- localhost maximalist
- FIPs: Fuck IPs

## Experiments in SEC-05

This cohort saw many experimentations in the tradition of [#SovEng](https://ants.sh/t/SovEng):

- We had a proper chef for our BBQs this time, and they were a feast with good cuts of handpicked meat from local butchers, Sangria, and freshly made Ponchas!
- We had outdoor BBQs after our Sunday hikes, and they were quite fun!
- Week 4 was an unstructured week to give everyone a breather from the intensity of the vibe, which was highly appreciated, and gave us new information to work with.
- Week 5 saw collaborative work for group demos, an exercise in composition and building more complex things, which resulted in some excellent projects.

## Paths Forward for "the other stuff"

We are starting to build less social media and more of the other stuff on Nostr. What we have on our hands are the seeds to completely rethink the entire Internet stack, layer 2 and upwards. We think we have the primitives and a general sense of direction to make ICANN and IANA irrelevant, DNS optional, Certificate Authorities unnecessary, and solve 402.

## Path Forward for SovEng

As has been shared with our Alumni, we are professionalising and making structural changes to SovEng. We are stronger and way more motivated than ever. SEC-05 truly felt like our experimentations had matured, and we are onto something truly radical. It's time to focus our efforts and boost this 10x. We have big plans for next year, which shall be announced as they materialise.

Next item on the agenda is to brainstorm how we want to conduct the next year and beyond. In the very least, there will be the regular two cohorts, but we want to be more focused and have continuity that SEC is. We have been contemplating doing at least 3 cohorts, of which two will be a bit shorter (in spring & fall) and one of regular length, i.e., 6 weeks (probably in summer). Along with that, we do wonder if we can do smaller sprints with select participants on focused domains. Maybe even 3-day sauna retreats.

A lot of what we can do in the immediate future depends on a lot of some things. Regardless, we are very ambitious and our stoke is over 9000! SovEng will continue, and we will keep shipping the future no matter what!

## Closing Notes

SEC-05 was a blast, but it wouldn't have been possible without our participants loosing sleep before Demo Days showing off their awesome vibes, the Captains for their time and leadership, the ladies at the Cowork being such wonderful hosts, [Ricardo](https://njump.me/npub1eh4lrnz8u6dl0uv75wf4q87fn5te7a5ss822u50p3qrpzuxyydkqcusg5d) our chef for the feasts, [André](https://njump.me/npub1tdc9um9kqfp9cqvjqtwswzsvqzdsgzkpn9swamed3286kfwpaljsrr8r0y) for providing the space, [Pablo](https://njump.me/npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft) for the groundwork, and Gigi for the heart he puts into SovEng and making it a point to participate despite his challenges.

<br>

**_Altright me laddies, now get back to yer piratin'! I'll leave y'all with this.._**

[<img src="./beacon-walled_garden-meme.png" width="420" height="640" alt="beacon-walled_garden-meme">](https://primal.net/e/nevent1qqsq5uap9tj235xayy49zmtwwc6yk3h3yxpyecg03kue6g5a6seze2ckr0xdv)
