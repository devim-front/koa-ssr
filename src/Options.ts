import { ReactElement } from 'react';
import { Context } from 'koa';

import { Page } from './Page';

/**
 * Коллекция настроек middleware.
 */
export type Options = {
  /**
   * Возвращает элемент React, который на клиенте должен был бы быть монтирован
   * в DOM с помощью метода `ReactDOM.render()`. Если функция возвращает
   * `false`, то дальнейшая обработка запроса прерывается и управление
   * отдаётся следующему middleware.
   *
   * @param context Контект запроса Koa.
   */
  createElement: (
    context: Context
  ) => ReactElement | false | Promise<ReactElement | false>;

  /**
   * Принимает на вход элемент, полученный с помощью функции `createElement`
   * и оборачивает его в другой элемент. Возвращает новый элемент. Если
   * функция возвращает `false`, то обработка текущего запроса прерывается и
   * управление передаётся следующему middleware.
   *
   * Данная функция полезна, если нам нужно обернуть дерево React в какой-либо
   * провайдер, используемый некой библиотекой при SSR.
   *
   * @param element Исходный элемент React.
   * @param context Контекст запроса Koa.
   */
  modifyElement?: (
    element: ReactElement,
    context: Context
  ) => ReactElement | false | Promise<ReactElement | false>;

  /**
   * Выполняет рендеринг указанного элемента. Если функция возвращает `false`,
   * то обработка текущего запроса прерывается и управление передаётся
   * следующему middleware.
   *
   * Если данная опция не указана, элемент будет отрисован с помощью
   * функции `renderToString` из библиотеки `react-dom`.
   *
   * @param element Элемент, который следует отрисовать.
   * @param context Контекст запроса Koa.
   */
  renderElement?: (
    element: ReactElement,
    context: Context
  ) => string | false | Promise<string | false>;

  /**
   * Создаёт представление страницы, в которую должно быть вставлен HTML-код,
   * сгенерированный при рендере приложения React. Если функция возвращает
   * `false`, то обработка текущего запроса прерывается и управление передаётся
   * следующему middleware.
   *
   * @param html HTML-код, сгенерированный при рендере приложения.
   * @param context Контекст запроса Koa.
   */
  createPage: (
    html: string,
    context: Context
  ) => Page | false | Promise<Page | false>;

  /**
   * Дописывает дополнительный HTML-код на страницу, сгенерированную функцией
   * `createPage`. Если функция возвращает `false`, то обработка текущего
   * запроса прерывается и управление передаётся следующему middleware.
   *
   * @param page Представление страницы.
   * @param context Контекст запроса Koa.
   */
  modifyPage?: (
    page: Page,
    context: Context
  ) => Page | false | Promise<Page | false>;
};
