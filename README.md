# Teams: Hide Out of Office Notice

Firefox extension that removes the "out of office and may not respond" banner
above the compose box in Microsoft Teams on the web, in every Teams language.
It runs locally and makes no network requests.

The banner is hidden and then dismissed through its own close button, since
hiding it alone leaves the compose box cropped at the top. This means you will
not see in the chat that a colleague is away.

It only acts on compose-area banners whose whole text is the notice, so messages,
chat list previews and search results that quote the wording are left alone.

## Install

**Temporary (removed when Firefox restarts):** open `about:debugging#/runtime/this-firefox`,
click *Load Temporary Add-on*, and select `manifest.json` or the `.xpi`.

**Permanent:** regular Firefox only installs signed extensions. Build the package and
upload it to [addons.mozilla.org](https://addons.mozilla.org/developers/) as
"On your own" (unlisted) to get a signed `.xpi`:

    zip teams-hide-ooo.xpi manifest.json notices.js content.js

## Updating the translations

`notices.js` is generated from the language files Teams publishes. If Microsoft
rewords the notice, the banner reappears in that language until you regenerate it,
bump the version in `manifest.json` and rebuild:

    python3 tools/update-notices.py

## Limitations

- Web version only; it does not affect the Teams desktop app.
- `teams.microsoft.us` (US government clouds) is not covered.
- It relies on Teams' current banner markup. If Microsoft changes it, the banner
  comes back rather than anything else being hidden.

## License

[MIT](LICENSE). The notice phrases in `notices.js` are Microsoft's own wording
and are not covered by this license.

This is an independent project and is not affiliated with or endorsed by Microsoft.
