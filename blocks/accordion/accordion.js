export default function decorate(block) {
  [...block.children].forEach((row) => {
    const question = row.children[0];
    const answer = row.children[1];
    if (!question || !answer) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = question.textContent;

    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.append(...answer.childNodes);

    details.append(summary);
    details.append(content);
    row.replaceWith(details);
  });
}
