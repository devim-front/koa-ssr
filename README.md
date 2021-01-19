# Devim Front: Koa SSR

Предоставляет middleware для сервера [Koa](https://koajs.com/), который осуществляет Server Side Rendering приложения на React.

## Установка

Так как middleware зависит как от Koa, так и от React, их следует установить:

```bash
npm i -S koa react react-dom
```

или, если вы используете Typescript:

```bash
npm i -S koa @types/koa react react-dom @types/react-dom
```

Затем установите саму библиотеку:

```bash
npm i -S @devim-front/koa-ssr
```

## Использование

Добавить middleware, которое просто отдаёт HTML-код, сгенерированный приложением React, можно так:

```tsx
import Koa from 'koa';
import { createElement } from 'react';
import { createMiddleware } from '@devim-front/koa-ssr';

const Component = () => <h1>It works!</h1>;

const app = new Koa();

app.use(
  createMiddleware({
    createElement() {
      return createElement(Component);
    },
  })
);

app.listen(8000);
```

Теперь любой запрос, отправленный на `http://localhost:8000` будет возвращать строку `<h1>It works!</h1>`.

## Общие принципы

Server Side Rendering любого приложения на React состоит из следующих этапов:

1. Создаётся корневой элемент приложения. На клиенте он бы монтировался на страницу с помощью функции `ReactDOM.render`.

2. Опционально, этот элемент может быть обёрнут в провайдеры внешних библиотек, которые обеспечивают их работу на сервере. Ярким примером тут может быть [styled-components](https://styled-components.com/docs/advanced#server-side-rendering). Для поддержки SSR она требует создать контекст, в который будут записываться сгенерированные стили, и обернуть в него корневой элемент (см. документацию библиотеки).

3. Затем корневой элемент (исходный, или обёртка над ним) преобразуется в строку с помощью методов из библиотеки `react-dom/server`: `renderToString` или `renderToStaticMarkup`.

4. Если нужно отдать клиенту не просто сгенерированный HTML-код, а целую страницу, то после этого контент подставляется в шаблон. Обычно шаблоном страницы служит файл `index.html`. Без SSR он бы просто отдавался клиенту, но теперь мы считываем его содержимое, ищём в нём тег `<div id="root"></div>` (то есть, точку монтирования приложения React), и программно вставляем в него сгенерированный контент: по сути, воспроизводим то, что в браузере делает функция `ReactDOM.render`.

5. Если мы используем библиотеки, которые подключают на страницу сгенерированные стили и скрипты (например, та же [styled-components](https://styled-components.com/docs/advanced#server-side-rendering)), мы можем также вставить их перед закрывающим тегом `</head>` и `</body>` соответственно.

6. Отдаём результат клиенту.

В качестве опций, наш middleware принимает на вход коллекцию функций, каждая из которых соответствует этапу описанного выше алгоритма. `createElement` создаёт корневой элемент вашего приложения, `modifyElement` оборачивает его в провайдеры, `createPage` создаёт шаблон страницы и добавляет в него сгенерированный контект и так далее.

## Примеры

Приведём распространённые сценарии использования. Данный раздел приводится исключительно для того, чтобы помочь понять принципы работы middleware. Многие кейсы ниже уже реализованы с помощью расширений из нашей экосистемы.

### Чтение шаблона страницы из файла index.html

```tsx
import Koa from 'koa';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createMiddleware, createPage, appendNode } from '@devim-front/koa-ssr';

import { App } from './App';

// Считываем содержимое шаблона страницы из файла.
const template = readFileSync(resolve(__dirname, './index.html'), 'utf8');

const app = new Koa();

app.use(
  createMiddleware({
    createElement() {
      // Создаём корневой элемент приложения.
      return createElement(App);
    },

    createPage(content) {
      // Создаём менеджер содержимого страницы. Он предоставляет методы для
      // простой вставки кода в её ключевые места: <head>, <body> и
      // в произвольные теги.
      const page = createPage(template);

      // Вставляем сгенерированный контент в <div id="root"></div>.
      return appendNode(page, 'root', content);
    },
  })
);

app.listen(8000);
```

### Использование со styled-components

```tsx
import Koa from 'koa';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ServerStyleSheet } from 'styled-components';
import {
  createMiddleware,
  createPage,
  appendNode,
  appendHead,
  setContextValue,
  getContextValue,
} from '@devim-front/koa-ssr';

import { App } from './App';

const template = readFileSync(resolve(__dirname, './index.html'), 'utf8');

const app = new Koa();

const STYLESHEET = Symbol('styled-components');

app.use(
  createMiddleware({
    createElement() {
      return createElement(App);
    },

    modifyElement(element, context) {
      const sheet = new ServerStyleSheet();

      // Здесь мы сохраняем объект состояния styled-components в
      // контексте запроса, чтобы потом извлечь его оттуда, когда
      // станем собирать итоговую страницу. Это основной способ
      // передачи данных между этапами жизненного цикла запроса.
      setContextValue(context, STYLESHEET, sheet);

      return sheet.collectStyles(element);
    },

    createPage(content) {
      const page = createPage(template);
      return appendNode(page, 'root', content);
    },

    modifyPage(page, context) {
      // Собственно, вот мы его и извлекаем.
      const sheet = getContextValue<ServerStyleSheet>(context, STYLESHEET);

      if (sheet == null) {
        return page;
      }

      const styles = sheet.getStyleTags();

      // Записываем в HEAD страницы сгенерированные стили.
      return appendHead(page, styles);
    },
  })
);

app.listen(8000);
```

### Роутинг с помощью react-router-dom

```tsx
import Koa from 'koa';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { StaticRouter } from 'react-router-dom';
import {
  createMiddleware,
  createPage,
  appendNode,
  setContextValue,
  getContextValue,
} from '@devim-front/koa-ssr';

import { App } from './App';

const template = readFileSync(resolve(__dirname, './index.html'), 'utf8');

const app = new Koa();

const ROUTER_CONTEXT = Symbol('react-router-dom');

app.use(
  createMiddleware({
    createElement() {
      return createElement(App);
    },

    modifyElement(element, context) {
      const { url: location } = context;

      const routerContext = {};
      setContextValue(context, ROUTER_CONTEXT, routerContext);

      // Мы оборачиваем приложение в StaticRouter, который нужен
      // чтобы наши <Route> работали и на сервере тоже; сверх того,
      // передаём URL из запроса роутеру нашего приложения на React.
      // Подробнее об этом смотрите в документации react-router-dom.
      return createElement(
        StaticRouter,
        { location, context: routerContext },
        element
      );
    },

    // Обычно эта функция предназначена для пост-обработки контента,
    // сгенерированного приложением. Но здесь мы используем её для
    // маршрутизации и управления заголовками ответа. Важно, что к
    // этому моменту код приложения React уже выполнился, а сборка
    // итоговой страницы ещё не началась.
    modifyContent(content, context) {
      const { url, statusCode } = getContextValue(context, ROUTER_CONTEXT);

      if (url != null) {
        // Задаём статус ответа сервера и выполняем перенаправление на
        // страницу, которую назначило наше приложение React.
        context.status = statusCode || 302;
        context.redirect(url);

        // Любая фукнция из опций может вернуть false. Это означает,
        // что на этом этапе следует прекратить наш алгоритм.
        return false;
      }

      context.status = statusCode || 200;

      return content;
    },

    createPage(content) {
      const page = createPage(template);
      return appendNode(page, 'root', content);
    },
  })
);

app.listen(8000);
```

## Расширения

Как было сказано ранее, многие из сценариев выше уже реализованы. Сделано это с помощью расширений. Расширение - это функция, которая принимает на вход основую функцию `createMiddleware` и модифицирует её. Покажем, к примеру, как использовать расширение для styled-components:

```tsx
import Koa from 'koa';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { withStyledComponents } from '@devim-front/koa-ssr-styled-components';
import {
  createMiddleware as createBaseMiddleware,
  createPage,
  appendNode,
} from '@devim-front/koa-ssr';

import { App } from './App';

const template = readFileSync(resolve(__dirname, './index.html'), 'utf8');

const app = new Koa();

const createMiddleware = withStyledComponents(createBaseMiddleware);

app.use(
  createMiddleware({
    createElement() {
      return createElement(App);
    },

    createPage(content) {
      const page = createPage(template);
      return appendNode(page, 'root', content);
    },
  })
);

app.listen(8000);
```

## Доступные расширения

- [@devim-front/koa-ssr-webpack](https://github.com/devim-front/koa-ssr-loadable-component) - добавляет middleware функционал webpack-dev-server.
- [@devim-front/koa-ssr-loadable-component](https://github.com/devim-front/koa-ssr-loadable-component) - добавляет поддержку [@loadable/component](https://loadable-components.com/);
- [@devim-front/koa-ssr-react-router-dom](https://github.com/devim-front/koa-ssr-react-router-dom) - добавляет поддержку [react-router-dom](https://reactrouter.com/web/guides/quick-start);
- [@devim-front/koa-ssr-styled-components](https://github.com/devim-front/koa-ssr-styled-components) - добавляет поддержку [styled-components](https://styled-components.com/);
- [@devim-front/koa-ssr-react-helmet-async](https://github.com/devim-front/koa-ssr-react-helmet-async) - добавляет поддержку [react-helmet-async](https://github.com/staylor/react-helmet-async).

## API

Раздел находится в стадии заполнения.
