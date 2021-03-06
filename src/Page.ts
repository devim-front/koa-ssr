/**
 * Представляет страницу, в которую должно быть примонтировано дерево React.
 */
export type Page = {
  /**
   * Шаблон содержимого страницы.
   */
  base: string;

  /**
   * Дополнительный код, который должен быть вставлен перед закрывающим тегом
   * HEAD.
   */
  head: string;

  /**
   * Дополнительный код, который должен быть вставлен перед закрывающим тегом
   * BODY.
   */
  body: string;

  /**
   * Дополнительные атрибуты тега HTML.
   */
  htmlAttributes: string;

  /**
   * Дополнительные атриубты тега BODY.
   */
  bodyAttributes: string;

  /**
   * Дополнительный код, который должен быть вставлен в определённые узлы
   * на странице. Коллекция сгруппирована по идентификаторам этих узлов.
   */
  nodes: Record<string, string>;
};
