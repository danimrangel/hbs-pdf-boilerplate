import HandlebarsJS from "https://cdn.skypack.dev/handlebars?dts";
import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";

import {
  dirname,
  fromFileUrl,
  join,
  toFileUrl,
} from "https://deno.land/std@0.134.0/path/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

import data from "./data.json" assert { type: "json" };

const __dirname = dirname(fromFileUrl(import.meta.url));

const hbs = await Deno.readFile("./template.hbs");
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const fractionDigits = 2;
const incorrectDecimalSeparator = ".";
const correctDecimalSeparator = ",";

const ParseDecimalValues = (value: string) =>
  parseFloat(value).toFixed(fractionDigits).replace(
    incorrectDecimalSeparator,
    correctDecimalSeparator,
  );

enum Answer {
  S = "Si",
  N = "No",
}

const ParseBooleansAsStrings = (
  value: boolean,
): Answer => (value ? Answer.S : Answer.N);

const ifCondition = (
  v1: string,
  operator: string,
  v2: string,
  //@ts-ignore explicit
  options: any,
) => {
  switch (operator) {
    case "==":
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case "===":
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case "!=":
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
    case "!==":
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case "<":
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case "<=":
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case ">":
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case ">=":
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case "&&":
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case "||":
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
};

HandlebarsJS.registerHelper("parseBooleansAsStrings", ParseBooleansAsStrings);
HandlebarsJS.registerHelper("parseDecimalValues", ParseDecimalValues);
HandlebarsJS.registerHelper("ifCondition", ifCondition);

const template = HandlebarsJS.compile(decoder.decode(hbs));

await Deno.writeFile("./index.html", encoder.encode(template(data)));

// PDF

const { href: website } = toFileUrl(join(__dirname, "./index.html"));

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(website, {
  waitUntil: "networkidle2",
});

try {
  Deno.remove("./generated.pdf");
} catch (_e) {
  console.log("No file found...");
}

await page.pdf({ path: "generated.pdf" });
await browser.close();
