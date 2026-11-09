import { createDigitValidator } from "./digit.js";
import { isValidGuess } from "./valid.js";
import { evaluateGuess } from "./evaluate.js";
import { generateSecret } from "./secret.js";
import { countPossibleSecrets } from "./count.js";

type RecordEntry = {
  attempts: number;
  seconds: number;
  length: number;
  base: number;
};
type Guess = { value: string; bulls: number; cows: number };
type Game = {
  secret: string;
  length: number;
  base: number;
  started: number;
  history: Guess[];
  won: boolean;
};
const storageKey = "bulls-and-cows-records";
let game: Game | null = null;
let records: RecordEntry[] = [];
try {
  const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
  if (Array.isArray(saved))
    records = saved.filter(
      (item): item is RecordEntry =>
        item &&
        ["attempts", "seconds", "length", "base"].every((key) =>
          Number.isFinite(item[key]),
        ),
    );
} catch {
  /* Storage may be unavailable or invalid. */
}
const app = document.createElement("main");
app.className = "app";
document.body.append(app);
const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const button = (text: string): HTMLButtonElement => {
  const node = element("button", text);
  node.type = "button";
  return node;
};
function render(): void {
  app.replaceChildren();
  const lastGuess = game?.history[game.history.length - 1];
  const mascots = element(
    "div",
    undefined,
    `mascots${game?.won ? " celebration" : ""}`,
  );
  const mascot = (
    name: string,
    label: string,
    count: number,
    reaction: boolean,
  ): HTMLElement => {
    const character = element(
      "div",
      undefined,
      `mascot ${name}${reaction ? " react" : ""}`,
    );
    const picture = element("img");
    picture.src = `./assets/${name}.png`;
    picture.alt = "";
    picture.draggable = false;
    const caption = element("div", undefined, "mascot-caption");
    caption.append(
      element("strong", label),
      element("span", game?.history.length ? String(count) : "?"),
    );
    character.append(picture, caption);
    return character;
  };
  mascots.append(
    mascot("bull", "БЫКИ", lastGuess?.bulls ?? 0, Boolean(lastGuess?.bulls)),
    mascot("cow", "КОРОВЫ", lastGuess?.cows ?? 0, Boolean(lastGuess?.cows)),
  );
  mascots.setAttribute("aria-label", "Результат последней попытки");
  const rules = element("aside", undefined, "rules");
  rules.append(
    element("span", "КАК ИГРАТЬ", "rules-title"),
    element("p", "Бык — цифра на своём месте."),
    element("p", "Корова — верная цифра, но не на своём месте."),
  );
  app.append(rules);
  const board = element("div", undefined, "board");
  app.append(board);
  const card = element("section", undefined, "card");
  board.append(card);
  if (!game) {
    card.append(
      element("p", "НАЧНЁМ С НАСТРОЕК", "section-index"),
      element("h2", "Новая игра"),
      element("p", "Выберите параметры секретного числа.", "muted"),
    );
    const form = element("form");
    const baseLabel = element("label", "Система счисления");
    const base = element("select");
    [
      [2, "Двоичная · 0–1"],
      [8, "Восьмеричная · 0–7"],
      [10, "Десятичная · 0–9"],
      [16, "Шестнадцатеричная · 0–9, A–F"],
    ].forEach(([value, title]) => {
      const option = element("option", String(title));
      option.value = String(value);
      option.selected = value === 10;
      base.append(option);
    });
    baseLabel.append(base);
    const lengthLabel = element("label", "Количество цифр");
    const length = element("select");
    for (let i = 2; i <= 6; i++) {
      const option = element("option", String(i));
      option.value = String(i);
      option.selected = i === 4;
      length.append(option);
    }
    lengthLabel.append(length);
    const combinations = element("p", "", "muted");
    const update = (): void => {
      Array.from(length.options).forEach((option) => {
        option.disabled = Number(option.value) > Number(base.value);
      });
      if (Number(length.value) > Number(base.value)) length.value = "2";
      combinations.textContent = `Возможных чисел: ${countPossibleSecrets(Number(length.value), Number(base.value)).toLocaleString("ru-RU")}`;
    };
    base.addEventListener("change", update);
    length.addEventListener("change", update);
    update();
    const start = element("button", "Начать игру");
    start.type = "submit";
    form.append(baseLabel, lengthLabel, combinations, start);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const size = Number(length.value);
      const radix = Number(base.value);
      game = {
        secret: generateSecret(size, radix),
        length: size,
        base: radix,
        started: Date.now(),
        history: [],
        won: false,
      };
      render();
    });
    card.append(form);
  } else {
    const current = game;
    card.append(
      element("p", "ИГРАЕМ", "section-index"),
      element("h2", current.won ? "Вы угадали!" : "Ваша попытка"),
      element(
        "p",
        `${current.length} цифры · основание ${current.base}`,
        "muted",
      ),
    );
    if (current.won)
      card.append(
        element(
          "p",
          `Число ${current.secret.toUpperCase()} угадано за ${current.history.length} попыток.`,
          "success",
        ),
      );
    else {
      const form = element("form");
      const label = element("label", "Введите число");
      const input = element("input");
      input.autocomplete = "off";
      input.maxLength = current.length;
      input.placeholder = "Например, 0123";
      const error = element("p", "", "error");
      error.setAttribute("role", "alert");
      input.addEventListener("input", () => {
        input.value = [...input.value]
          .filter(createDigitValidator(current.base))
          .join("");
        error.textContent = "";
      });
      label.append(input);
      const submit = element("button", "Проверить");
      submit.type = "submit";
      form.append(label, error, submit);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.toLowerCase();
        if (!isValidGuess(value, current.length, current.base)) {
          error.textContent = `Введите ${current.length} разных допустимых цифр.`;
          form.classList.remove("invalid");
          void form.offsetWidth;
          form.classList.add("invalid");
          return;
        }
        if (current.history.some((entry) => entry.value === value)) {
          error.textContent = "Эта попытка уже была.";
          form.classList.remove("invalid");
          void form.offsetWidth;
          form.classList.add("invalid");
          return;
        }
        const result = evaluateGuess(current.secret, value);
        const history = [...current.history, { value, ...result }];
        const won = result.bulls === current.length;
        game = { ...current, history, won };
        if (won) {
          records = [
            ...records,
            {
              attempts: history.length,
              seconds: Math.floor((Date.now() - current.started) / 1000),
              length: current.length,
              base: current.base,
            },
          ]
            .sort((a, b) => a.attempts - b.attempts || a.seconds - b.seconds)
            .slice(0, 10);
          try {
            localStorage.setItem(storageKey, JSON.stringify(records));
          } catch {
            /* Continue playing when storage is unavailable. */
          }
        }
        render();
      });
      card.append(form);
      setTimeout(() => input.focus(), 0);
    }
    if (current.history.length) {
      card.append(element("h3", "История попыток"));
      const list = element("ol", undefined, "history");
      current.history.forEach((entry) => {
        const row = element("li");
        row.append(
          element("strong", entry.value.toUpperCase()),
          element("span", `Быки: ${entry.bulls} · Коровы: ${entry.cows}`),
        );
        list.append(row);
      });
      card.append(list);
    }
    const reset = button("Новая игра");
    reset.className = "secondary";
    reset.addEventListener("click", () => {
      game = null;
      render();
    });
    card.append(reset);
  }
  const scores = element("section", undefined, "card scores");
  scores.append(
    element("p", "ЛУЧШИЕ РЕЗУЛЬТАТЫ", "section-index"),
    element("h2", "Рекорды"),
    element("p", "Лучшие результаты по числу попыток и времени.", "muted"),
  );
  if (!records.length)
    scores.append(
      element("p", "Пока нет результатов. Сыграйте первую партию!", "empty"),
    );
  else {
    const list = element("ol", undefined, "history");
    records.forEach((record) => {
      const row = element("li");
      row.append(
        element("strong", `${record.attempts} попыток · ${record.seconds} с`),
        element("span", `${record.length} цифр · основание ${record.base}`),
      );
      list.append(row);
    });
    scores.append(list);
  }
  const sidebar = element("div", undefined, "sidebar");
  sidebar.append(mascots, scores);
  board.append(sidebar);
}
render();
