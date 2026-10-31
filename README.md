# Eben Construction website

A static website with no build step. Every page is a plain HTML file, so GitHub Pages can host it for free as it is.

## Put it online

1. Create a public repository on GitHub and upload everything in this folder. `index.html` must sit at the top level of the repository.
2. In the repository, go to **Settings > Pages**.
3. Under **Source**, choose **Deploy from a branch**. Select the `main` branch and the `/ (root)` folder, then click **Save**.
4. After a minute or two, the site is live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

### Use eben-construction.com

1. In **Settings > Pages > Custom domain**, enter the domain and save.
2. At your domain registrar, point the domain to GitHub Pages using [GitHub's DNS instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
3. Turn on **Enforce HTTPS** once it becomes available.

Keep your existing email (MX) records when changing DNS, or email on the domain will stop working.

## Common updates

| To change | Edit |
| --- | --- |
| License number | `LICENSE_NUMBER` at the top of `assets/js/site.js` |
| Logo | Replace `logo-header.png` (no tagline), `logo.png` (full logo) and `favicon.png` in `assets/images/` |
| Home page animation | `assets/js/hero-office.js`, which uses the step names from the New Construction page |
| Project gallery | `PROJECTS` at the top of `assets/js/projects.js`, with photos in `assets/images/projects/` |
| Colors and fonts | The `:root` section at the top of `assets/css/styles.css` |
| Phone or email | Find and replace across all `.html` files |
| Menu or footer | Find and replace across all `.html` files, since each page has its own copy |
