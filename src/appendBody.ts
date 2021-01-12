import { Page } from './Page';

/**
 * Добавляет указанный HTML-код перед закрывающим тегом BODY переданной
 * страницы.
 *
 * @param page Представление страницы.
 * @param html Дополнительный HTML-код.
 */
export const appendBody = (page: Page, html: string): Page => ({
  ...page,
  body: `${page.body}${html}`,
});
