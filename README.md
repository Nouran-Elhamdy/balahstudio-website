# BALAH Studio – Navigation Overlay + Fading Hero

This is the UPDATED version of your original editable website, including the dedicated contact section.

## What changed
- Header navigation overlays the very top of the hero image (no separate navigation band).
- The lower edge of the hero fades smoothly into each theme’s page background.
- **Design → Layout → Hero fade start (%)** changes where the fade begins, with immediate preview.
- The Featured Game card slightly overlaps the fade for a soft transition.
- Hero is one full-width image (not separate image + HTML text columns). Studio wordmark, slogan and introductory copy in the starter art are part of the image.
- **The two functional buttons (Our Games, About Us) have been restored above the hero image.** They link to the Games and About sections.
- Change each button's label under Text → Homepage hero; customize its dimensions, light/dark background colors, text colors, border colors, spacing and image position under Style → Hero buttons.
- Separate full-width banners for light and dark mode; optional mobile-specific image for each mode.
- Featured game section displays an uploaded game logo in place of its text heading. In **Games → Game logo**, independently edit the logo WIDTH, HEIGHT, and TOP/RIGHT/BOTTOM/LEFT MARGINS for each game, with an instant visual preview. Reset those settings with **Reset logo size and margins**. The actual graphic keeps its proportions instead of stretching.
- Editor, navigation, theme toggle, game tints, about, values, and contact section are retained.

## How to edit locally
1. Extract the ZIP; open `balah_studio_website/index.html` in a browser.
2. Add `?edit=1` to the end of the URL (for example `file:///.../index.html?edit=1`).
3. Under **Images**, upload `Light-mode full hero banner` / `Dark-mode full hero banner`. These should contain the complete text/logo layout you want, because their text is NOT an editable HTML layer.
4. For phones, you may upload separate mobile-sized hero banners; otherwise the desktop image is scaled to fit, without cropping.
5. Under **Games**, choose a game, upload **Game title logo**, then adjust the six size/margin controls with live preview. A transparent PNG is recommended. To go back to plain text, click **Use text title instead**.
6. Under **Text**, set the Contact email yourself.
7. **Save → Download updated index.html**, and replace the file inside your extracted site folder. Exported files will retain uploaded artwork.

## Important notes
- The clickable navigation and theme switch OVERLAY the hero image. Do NOT bake a copy of the navigation or hero buttons into your uploaded banner or they will appear twice.
- **Do not bake hero buttons into your image.** The editable, clickable button pair overlays the full-width hero. Text in the actual image (BALAH logo/slogan) remains uneditable except by replacing the image.
- The included hero images and placeholder game logo are STARTER ASSETS made from the visual direction you supplied. Replace these with your approved composites when ready.
- The game title remains saved as text in settings and is announced as the game logo's alt text.
- Browser saved drafts are local, not automatically published. Export the updated HTML to make changes permanent.
- The site needs its `assets/`, `script.js`, and `styles.css` alongside `index.html`.
- To publish, deploy the extracted `balah_studio_website` folder to static hosting such as Netlify. No external platform is needed to edit locally.

## Important: making uploaded images permanent
1. Upload images under Images / Games and wait for them to appear in the preview.
2. Click Save → Download updated index.html, plus Back up settings (JSON).
3. Replace `index.html` in the website folder. Keep `script.js`, `styles.css`, and `assets/` with it.
4. Verify in a NEW private/incognito browser window without `?edit=1`. Your images are embedded in the exported `index.html` as data URLs; they do **not** require separately copying uploaded image files.
5. When publishing, upload the entire updated folder. A browser draft alone does not modify published files.

This release fixes old browser drafts overriding exported images. Drafts in this version are tied to the specific `index.html` they came from, and visitors see the published content. If you have unsaved work from an older ZIP, export a JSON backup from that editor and import it into this version; an older local browser draft may also be recoverable via Save → Recover previous-version browser draft (only in the same browser origin).

## Game-logo sizing and existing settings
- Game-logo dimensions and margins are saved per game in exported index.html and in settings JSON backups. Each game can have its own measurements.
- Width: 40–500 px; height: 25–260 px; each margin: −100 to +200 px. The image uses `object-fit: contain` and does not stretch; very large dimensions may exceed the game card.
- For older backups that do not contain logo-layout settings, default values are applied automatically. Use **Save → Import settings** to bring previous changes into this version.
- Exporting index.html remains essential after any image or logo changes; verify in a private window.

## Featured game: single screenshot and adjustable layout
- The game card now displays ONE image only, with no secondary screenshot, hearts, stars or circle decorations around it.
- In **Games → Game showcase · one image**, upload the image and edit its width, height, top/right/bottom/left margins. This is per-game and updates immediately.
- Use **Reset screenshot size and margins** to restore defaults. It maintains your image's natural proportions (object-fit: contain); on small phones it scales to fit.
- Previously uploaded `detailImage` data in older backups may remain inside the settings for compatibility, but is no longer displayed in the featured game card.

## About / Values icons
- In **Images → About / values card icons** upload each of the four card icons (PNG with transparency or WebP recommended).
- Use **All four icons · size (px)** to resize every icon together (20–120 px). The same option also appears in Style.
- You can reset icon uploads to the original built-in SVG icons with **Restore built-in card icons**.
- Icon images, global size, per-game screenshot sizes/margins, and all other editor settings are saved in the HTML export and JSON backup. Old backup files work; missing new settings get defaults.
- Follow **Save → Download updated index.html**, replace the website's index.html (leave its other files alongside it), and inspect in a private browser window without `?edit=1`.
