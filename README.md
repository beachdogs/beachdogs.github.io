# beach-dog

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below.

[Continue working on v0 →](https://v0.app/chat/projects/prj_OGX4t5TGQUq6uZnnYH72vaVHM0Lv)

## GitHub Pages

Pushes to `main` build a static export and deploy it to [https://beachdogs.github.io](https://beachdogs.github.io).

Before the first deploy, open the repository on GitHub and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Blog & Playbook

The blog is fully static and driven by Markdown files in `content/blog/`.

### Writing a New Post

1. Create a `.md` file in `content/blog/` (e.g. `content/blog/my-new-post.md`).
2. Add the frontmatter block at the top:
   ```yaml
   ---
   title: "Your Post Title"
   date: "2026-11-10"
   summary: "A brief one-to-two sentence summary for the card preview."
   tags: ["Playables", "Marketing", "Retention"]
   author: "Beach Dog Team"
   authorRole: "Viral Growth & Playables"
   coverImage: "/blog/my-cover-image.svg" # Optional (place file in public/blog/)
   ---
   ```
3. Write your content in Markdown below the frontmatter. Headings (`#`, `##`, `###`), lists, blockquotes, tables, bold/italic, code blocks, and images (`![alt](/path)`) are supported.
4. Preview locally with `pnpm dev` at `http://localhost:3000/blog`.
5. Deploy remotely by committing and pushing to `main`. GitHub Actions automatically generates the static pages and deploys them to `https://beachdogs.github.io/blog`.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

