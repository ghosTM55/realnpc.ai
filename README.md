# RealNPC

Official website of RealNPC: <https://realnpc.ai>

Create a Soul uses five steps: character selection, relationship personalities, assembly, detailed settings, and review. Review summarizes the configuration; its final action opens the independent `/demo/` conversation page. The demo applies the selected personality and conversational settings; no API request is sent until the visitor sends a message. Each character has a fixed name, age, gender and background. Draft schema v5 normalizes previously edited identities to their selected character while preserving personality and assembly choices. Published v1–v3 drafts retain supported choices and restart at character selection; unreleased v4 drafts reset to defaults. Obsolete review/quotation fields are no longer saved.

The optional conversation service is documented in [services/soul-api/README.md](services/soul-api/README.md). It runs separately from the static website; API keys never belong in the browser bundle.
