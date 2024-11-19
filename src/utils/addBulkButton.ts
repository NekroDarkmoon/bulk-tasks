import { moduleId } from "../constants.ts"
import { localize } from "./localize.ts";

const TABS = ['scenes', 'actors', 'items', 'journal', 'tables', 'cards', 'playlists', 'macros'] as const;

export function addBulkButton(app, html: JQuery) {
  const forGMOnly = game.settings?.get(moduleId, 'gmOnly');

  if (forGMOnly && !game.user?.isGM) return;
  if (!TABS.includes(app.tabName)) return;

  const button = document.createElement('button');
  button.classList.add('bulk-tasks-dialog-button');
  button.textContent = localize("BulkTasks.title");

  const i = document.createElement('i');
  i.classList.add('fa-solid');
  i.classList.add('fa-edit');

  button.appendChild(i);

  const parent = html.find('.header-actions');
  if (!parent) return;

  parent.append(button);

  // Add Event Listener
  button.addEventListener('click', (e) => {
    console.log('I a big boy.')
  });
}
