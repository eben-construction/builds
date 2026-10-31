/* ---- Add finished projects here -----------------------------------------
   1. Put the photos in the assets/images/projects folder.
   2. Copy the example below, remove the // marks, and fill it in.
   Use one of these exact categories:
     New Construction, Kitchen Remodels, Bathroom Remodels,
     Home Renovations, Additions, Exterior Projects
   Any category with no projects shows a "photos coming soon" card.
   ------------------------------------------------------------------------ */
const PROJECTS = [
  // {
  //   title: 'Coastal Kitchen Remodel',
  //   category: 'Kitchen Remodels',
  //   location: 'Tampa, FL',   // optional, delete this line to hide it
  //   description: 'One or two sentences about the project.',
  //   scope: ['New cabinetry', 'Quartz countertops', 'Lighting upgrade'],
  //   photos: ['assets/images/projects/kitchen-1.jpg', 'assets/images/projects/kitchen-2.jpg'],
  // },
];

const drawing = (paths) =>
  `<svg viewBox="0 0 320 200" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const CATEGORIES = {
  'New Construction': drawing(`
    <path d="M40 165H280M80 165V95H240V165M64 95L160 42L256 95"/>
    <path d="M144 165V120H176V165M100 112H126V138H100ZM194 112H220V138H194Z"/>
    <path stroke="#f27a1a" d="M40 180H280M40 174V186M280 174V186"/>`),
  'Kitchen Remodels': drawing(`
    <path d="M36 165H284M36 118H284M36 118V165M284 118V165M36 128H284"/>
    <path d="M96 128V165M160 128V165M222 128V165M50 40H130V88H50ZM90 40V88M190 40H270V88H190ZM230 40V88"/>
    <path stroke="#f27a1a" d="M150 118V82C150 70 170 70 170 82V90"/>`),
  'Bathroom Remodels': drawing(`
    <path d="M36 165H284M56 112H200V126C200 148 186 156 168 156H88C70 156 56 148 56 126ZM76 156V165M180 156V165"/>
    <path d="M74 112V62C74 46 100 46 100 62V68"/>
    <path d="M226 40H270V100H226ZM226 165V100M270 165V100"/>
    <path stroke="#f27a1a" d="M90 68H110M95 78V90M105 78V90"/>`),
  'Home Renovations': drawing(`
    <path d="M40 165H280M72 165V60H248V165M72 60L160 28L248 60M160 44V165"/>
    <path d="M92 86H140V134H92ZM180 86H228V134H180ZM116 86V134M92 110H140"/>
    <path stroke="#f27a1a" stroke-dasharray="6 6" d="M180 86L228 134M228 86L180 134"/>`),
  Additions: drawing(`
    <path d="M36 165H284M56 165V82H176V165M44 82L116 40L188 82M92 165V118H122V165"/>
    <path stroke="#f27a1a" stroke-dasharray="6 6" d="M176 100H268V165M170 100L222 66L276 100"/>
    <path stroke="#f27a1a" d="M204 122H240V146H204Z"/>`),
  'Exterior Projects': drawing(`
    <path d="M36 165H284M84 165V82H236V165M66 82L160 36L254 82M144 165V116H176V165"/>
    <path d="M100 100H126V126H100ZM194 100H220V126H194Z"/>
    <path stroke="#f27a1a" d="M46 165C42 130 50 104 46 84M46 84C34 76 26 80 22 88M46 84C58 74 66 78 72 86M46 84C40 70 30 66 24 68M46 84C52 70 62 66 68 68"/>`),
};

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const grid = document.getElementById('project-grid');
const filters = document.getElementById('filters');
const dialog = document.getElementById('project-dialog');
const dialogContent = document.getElementById('dialog-content');

function projectCard(project, index) {
  const place = project.location ? `<span class="project-place">${esc(project.location)}</span>` : '';
  return `
    <li>
      <button type="button" class="project" data-index="${index}">
        <span class="project-media">
          <img src="${esc(project.photos[0])}" alt="${esc(project.title)}" loading="lazy">
        </span>
        <span class="project-body">
          <span class="label">${esc(project.category)}</span>
          <span class="project-title">${esc(project.title)}</span>
          ${place}
        </span>
      </button>
    </li>`;
}

function comingSoonCard(category) {
  return `
    <li>
      <div class="project">
        <div class="project-media blueprint">${CATEGORIES[category]}</div>
        <div class="project-body">
          <p class="label">${esc(category)}</p>
          <h3>Photos coming soon</h3>
          <p>Ask us about our recent work in this category.</p>
        </div>
      </div>
    </li>`;
}

function render(active) {
  const projects = PROJECTS
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => active === 'All' || project.category === active);

  const empty = Object.keys(CATEGORIES).filter((category) =>
    (active === 'All' || active === category) &&
    !PROJECTS.some((project) => project.category === category));

  grid.innerHTML =
    projects.map(({ project, index }) => projectCard(project, index)).join('') +
    empty.map(comingSoonCard).join('');
}

function openProject(project) {
  const photos = project.photos
    .map((src, i) => `<img src="${esc(src)}" alt="${esc(project.title)}, photo ${i + 1}" loading="lazy">`)
    .join('');
  const scope = (project.scope || []).map((item) => `<li>${esc(item)}</li>`).join('');

  dialogContent.innerHTML = `
    <div class="dialog-photos">${photos}</div>
    <div class="dialog-body">
      <p class="label">${esc(project.category)}${project.location ? ` / ${esc(project.location)}` : ''}</p>
      <h2>${esc(project.title)}</h2>
      ${project.description ? `<p>${esc(project.description)}</p>` : ''}
      ${scope ? `<h3>Scope of work</h3><ul>${scope}</ul>` : ''}
    </div>`;
  dialog.showModal();
}

filters.innerHTML = ['All', ...Object.keys(CATEGORIES)]
  .map((name, i) => `<button type="button" aria-pressed="${i === 0}" data-filter="${esc(name)}">${esc(name)}</button>`)
  .join('');

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  render(button.dataset.filter);
});

grid.addEventListener('click', (event) => {
  const card = event.target.closest('button.project');
  if (card) openProject(PROJECTS[Number(card.dataset.index)]);
});

dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

render('All');
