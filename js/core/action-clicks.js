export function bindActionClicks(root, activate) {
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (button && root.contains(button)) activate(button);
  });
}
