const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const outputFile = path.join(rootDir, 'index.html');

function readJson(fileName) {
    return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'));
}

function renderNav(profile) {
    return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="sideNav">
        <a class="navbar-brand js-scroll-trigger" href="#page-top">
            <span class="d-block d-lg-none">${profile.name}</span>
            <span class="d-none d-lg-block"><img class="img-fluid img-profile rounded-circle mx-auto mb-2"
                    src="dist/assets/img/profile.jpg" alt="${profile.name}" /></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive"
            aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"><span
                class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav">
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#about">About Me</a></li>
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#experience">Experience</a></li>
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#projects">Projects</a></li>
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#education">Education</a></li>
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#certifications">Certifications</a></li>
                <li class="nav-item"><a class="nav-link js-scroll-trigger" href="#skills">Skills</a></li>
                <li class="nav-item"><a class="nav-link" href="${profile.resumeUrl}">Resume <i class="fa-solid fa-arrow-up-right-from-square"></i></a></li>
            </ul>
        </div>
    </nav>
  `;
}

function renderBio(profile) {
    const paragraphs = profile.bio
        .map((paragraph) => `<p class="lead mb-3">${paragraph}</p>`)
        .join('');

    return `
    <section class="resume-section" id="about">
        <div class="resume-section-content">
            <h1 class="mb-0">
                ${profile.name.split(' ')[0]}
                <span class="text-primary">${profile.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div class="subheading mb-5">
                ${profile.phone} ·
                <a href="mailto:${profile.email}">${profile.email}</a>
            </div>
            ${paragraphs}
            <div class="social-icons">
                <a class="social-icon" href="${profile.linkedin}" target="_blank" rel="noreferrer noopener" aria-label="My LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a class="social-icon" href="${profile.github}" target="_blank" rel="noreferrer noopener" aria-label="My GitHub"><i class="fab fa-github"></i></a>
                <a class="social-icon" href="${profile.labUrl}" target="_blank" rel="noreferrer noopener" aria-label="My Secret Lab"><i class="fa-solid fa-flask-vial"></i></a>
            </div>
        </div>
    </section>
  `;
}

function renderExperience(entries) {
    const items = entries.map((entry) => `
    <div class="timeline-block d-flex flex-column flex-md-row justify-content-between mb-5">
      <div class="flex-grow-1">
        <h3 class="mb-0">${entry.title}</h3>
        <div class="subheading mb-3">${entry.company}</div>
        ${entry.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
      </div>
      <div class="timeline-meta flex-shrink-0"><span class="text-primary">${entry.period}</span></div>
    </div>
  `).join('');

    return `
    <section class="resume-section" id="experience">
      <div class="resume-section-content">
        <h2 class="mb-5">Experience</h2>
        ${items}
      </div>
    </section>
  `;
}

function renderProjects(entries) {
    const items = entries.map((entry) => {
        const titleHtml = entry.link
            ? `<h3 class="mb-0"><a href="${entry.link}" target="_blank" rel="noopener noreferrer">${entry.title}</a></h3>`
            : `<h3 class="mb-0">${entry.title}</h3>`;

        const techHtml = entry.technologies && entry.technologies.length
            ? `<div class="subheading mb-3">Technologies Used</div><ul class="mb-0">${entry.technologies.map((tech) => `<li>${tech}</li>`).join('')}</ul>`
            : '';

        return `
      <div class="d-flex flex-column flex-md-row justify-content-between mb-5">
        <div class="flex-grow-1">
          ${titleHtml}
          ${entry.description ? `<p>${entry.description}</p>` : ''}
          ${techHtml}
        </div>
      </div>
    `;
    }).join('');

    return `
    <section class="resume-section" id="projects">
      <div class="resume-section-content">
        <h2 class="mb-5">Projects</h2>
        ${items}
      </div>
    </section>
  `;
}

function renderEducation(entries) {
    const items = entries.map((entry) => `
    <div class="timeline-block d-flex flex-column flex-md-row justify-content-between mb-5">
      <div class="flex-grow-1">
        <h3 class="mb-0">${entry.school}</h3>
        <div class="subheading mb-3">${entry.degree}</div>
        ${entry.details.map((detail) => `<p>${detail}</p>`).join('')}
      </div>
      <div class="timeline-meta flex-shrink-0"><span class="text-primary">${entry.period}</span></div>
    </div>
  `).join('');

    return `
    <section class="resume-section" id="education">
      <div class="resume-section-content">
        <h2 class="mb-5">Education</h2>
        ${items}
      </div>
    </section>
  `;
}

function renderCertifications(entries) {
    const groups = entries.map((group) => {
        const itemList = group.items.map((item) => {
            const range = item.range ? ` (${item.range})` : '';
            return `<li><span class="fa-li"><i class="fa-solid fa-trophy"></i></span><a href="${item.href}">${item.label}</a>${range}</li>`;
        }).join('');

        return `
      <div class="subheading mb-1">${group.group}</div>
      <ul class="fa-ul mb-3">
        ${itemList}
      </ul>
    `;
    }).join('');

    return `
    <section class="resume-section" id="certifications">
      <div class="resume-section-content">
        <h2 class="mb-5">Certifications</h2>
        ${groups}
      </div>
    </section>
  `;
}

function renderSkills(data) {
    const technical = data.technical.map((skill) => {
        const subitems = skill.items.length
            ? `<ul>${skill.items.map((item) => `<li>${item}</li>`).join('')}</ul>`
            : '';
        return `<li>${skill.label}${subitems}</li>`;
    }).join('');

    const management = data.management.map((item) => `<li>${item}</li>`).join('');

    return `
    <section class="resume-section" id="skills">
      <div class="resume-section-content">
        <h2 class="mb-5">Skills</h2>
        <div class="subheading mb-1">Technical</div>
        <ul class="mb-3">
          ${technical}
        </ul>
        <div class="subheading mb-1">Management</div>
        <ul class="mb-3">
          ${management}
        </ul>
      </div>
    </section>
  `;
}

function renderPage() {
    const profile = readJson('profile.json');
    const experience = readJson('experience.json');
    const projects = readJson('projects.json');
    const education = readJson('education.json');
    const certifications = readJson('certifications.json');
    const skills = readJson('skills.json');

    const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="A resume website owned and operated by Matt Koster." />
    <meta name="author" content="Matt Koster" />
    <title>${profile.title}</title>
    <link rel="icon" type="image/x-icon" href="dist/assets/img/favicon.ico" />
    <script src="https://use.fontawesome.com/releases/v6.5.1/js/all.js" crossorigin="anonymous"></script>
    <link href="https://fonts.googleapis.com/css?family=Saira+Extra+Condensed:500,700" rel="stylesheet" type="text/css" />
    <link href="https://fonts.googleapis.com/css?family=Muli:400,400i,800,800i" rel="stylesheet" type="text/css" />
    <link href="dist/css/site.css" rel="stylesheet" />
</head>

<body id="page-top">
    ${renderNav(profile)}
    <div class="container-fluid p-0">
        ${renderBio(profile)}
        <hr class="m-0" />
        ${renderExperience(experience)}
        <hr class="m-0" />
        ${renderProjects(projects)}
        <hr class="m-0" />
        ${renderEducation(education)}
        <hr class="m-0" />
        ${renderCertifications(certifications)}
        <hr class="m-0" />
        ${renderSkills(skills)}
        <hr class="m-0" />
    </div>
</body>
</html>`;

    fs.writeFileSync(outputFile, html);
    console.log(`Rendered site to ${outputFile}`);
}

renderPage();
