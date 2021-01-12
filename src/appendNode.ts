import { Page } from './Page';

/**
 * Добавляет указанный HTML-код перед закрывающим тегом элемента с переданным
 * идентификатором.
 *
 * @param page Представление страницы.
 * @param id Идентфикатор.
 * @param html Дополнительный HTML-код.
 */
export const appendNode = (page: Page, id: string, html: string): Page => ({
  ...page,
  nodes: {
    ...page.nodes,
    [id]: `${page.nodes[id] || ''}${html}`,
  },
});
