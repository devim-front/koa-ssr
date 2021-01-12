import { Page } from './Page';

/**
 * Добавляет указанный HTML-код перед закрывающим тегом HEAD переданной
 * страницы.
 *
 * @param page Представление страницы.
 * @param html Дополнительный HTML-код.
 */
export const appendHead = (page: Page, html: string): Page => ({
  ...page,
  head: `${page.head}${html}`,
});
