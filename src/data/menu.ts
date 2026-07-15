// Cardápio Doce Sonho - dados extraídos do PDF oficial
// Preços por: 'cento' (100 unid), 'kg', 'un'
// Salgados/produtos por cento: mínimo de 25 unidades

import folhadosImg from "@/assets/cat-folhados.jpg";
import fritosImg from "@/assets/cat-fritos.jpg";
import assadosImg from "@/assets/cat-assados.jpg";
import canapesImg from "@/assets/cat-canapes.jpg";
import miniLanchesImg from "@/assets/cat-mini-lanches.jpg";
import baguetesImg from "@/assets/cat-baguetes.jpg";
import pizzasImg from "@/assets/cat-pizzas.jpg";
import bolosCaseirosImg from "@/assets/cat-bolos-caseiros.jpg";
import bolosConfeitadosImg from "@/assets/cat-bolos-confeitados.jpg";
import tortasImg from "@/assets/cat-tortas.jpg";
import docesImg from "@/assets/cat-doces.jpg";
import rotisserieImg from "@/assets/cat-rotisserie.jpg";

export type PriceUnit = "cento" | "kg" | "un";

export interface OptionItem {
  name: string;
  veg?: boolean;
}
export interface OptionGroup {
  label: string;
  min: number; // required minimum selections
  max: number; // max selections (1 = single-select)
  options: OptionItem[];
}
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: PriceUnit;
  minQty: number; // in unit (unidades para cento/un, kg para kg)
  step: number;
  category: CategoryId;
  optionGroups?: OptionGroup[];
  image?: string; // opcional — foto customizada do produto (admin)
}


export type CategoryId =
  | "folhados"
  | "fritos"
  | "assados"
  | "canapes"
  | "mini-lanches"
  | "baguetes"
  | "pizzas"
  | "bolos-caseiros"
  | "bolos-confeitados"
  | "tortas"
  | "doces"
  | "rotisserie";

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  { id: "folhados", name: "Salgados Folhados", short: "Folhados", image: folhadosImg, description: "Massa folhada crocante — preço por cento (100 un)" },
  { id: "fritos", name: "Salgados Fritos", short: "Fritos", image: fritosImg, description: "Fritinhos crocantes — preço por cento (100 un)" },
  { id: "assados", name: "Salgados Assados", short: "Assados", image: assadosImg, description: "Assados no forno — preço por cento (100 un)" },
  { id: "canapes", name: "Canapés e Petiscos", short: "Canapés", image: canapesImg, description: "Canapés, bolos e tortas salgadas, rabanada" },
  { id: "mini-lanches", name: "Mini Lanchinhos", short: "Mini Lanches", image: miniLanchesImg, description: "Mini pães recheados e mini lanches especiais" },
  { id: "baguetes", name: "Baguetes Recheadas", short: "Baguetes", image: baguetesImg, description: "Baguetes montadas na hora — preço por kg" },
  { id: "pizzas", name: "Pizzas", short: "Pizzas", image: pizzasImg, description: "Para assar em casa" },
  { id: "bolos-caseiros", name: "Bolos Caseiros", short: "Caseiros", image: bolosCaseirosImg, description: "Bolos caseiros — unidade" },
  { id: "bolos-confeitados", name: "Bolos Confeitados", short: "Confeitados", image: bolosConfeitadosImg, description: "Bolos confeitados — preço por kg" },
  { id: "tortas", name: "Tortas Especiais", short: "Tortas", image: tortasImg, description: "Tortas doces — preço por kg" },
  { id: "doces", name: "Doces", short: "Doces", image: docesImg, description: "Docinhos e bombons — preço por cento (100 un)" },
  { id: "rotisserie", name: "Rotisserie", short: "Rotisserie", image: rotisserieImg, description: "Pratos prontos — preço por kg" },
];

// Helpers
const cento = (n: number): Pick<Product, "price" | "unit" | "minQty" | "step"> => ({ price: n, unit: "cento", minQty: 25, step: 1 });
const kg = (n: number): Pick<Product, "price" | "unit" | "minQty" | "step"> => ({ price: n, unit: "kg", minQty: 0.5, step: 0.5 });
// Bolos confeitados / tortas: mínimo 1 kg com incrementos de 100 g (1,0 / 1,1 / 1,2 ...)
const kgWhole = (n: number): Pick<Product, "price" | "unit" | "minQty" | "step"> => ({ price: n, unit: "kg", minQty: 1, step: 0.1 });
const un = (n: number): Pick<Product, "price" | "unit" | "minQty" | "step"> => ({ price: n, unit: "un", minQty: 1, step: 1 });

const sabor = (opts: OptionItem[], label = "Escolha o sabor"): OptionGroup => ({ label, min: 1, max: 1, options: opts });

export const products: Product[] = [
  // ============ FOLHADOS ============
  {
    id: "croissant", name: "Croissant", category: "folhados", ...cento(169),
    description: "Massa folhada dourada, recheada.",
    optionGroups: [sabor([
      { name: "Queijo", veg: true },
      { name: "Presunto e queijo" },
      { name: "Frango cremoso" },
    ])],
  },
  {
    id: "trouxinha-folhada", name: "Trouxinha Folhada", category: "folhados", ...cento(169),
    description: "Trouxinha de massa folhada.",
    optionGroups: [sabor([
      { name: "Palmito", veg: true },
      { name: "Frango cremoso" },
      { name: "Ricota com gorgonzola", veg: true },
      { name: "Peito de peru e cheddar" },
    ])],
  },

  // ============ FRITOS ============
  { id: "coxinha", name: "Coxinha", category: "fritos", ...cento(109), description: "Recheio de frango.", optionGroups: [sabor([{ name: "Frango" }])] },
  { id: "bolinha", name: "Bolinha de Queijo", category: "fritos", ...cento(109), optionGroups: [sabor([{ name: "Queijo", veg: true }])] },
  { id: "crispy", name: "Crispy", category: "fritos", ...cento(109), optionGroups: [sabor([{ name: "Milho com Catupiry", veg: true }])] },
  { id: "croquete", name: "Croquete", category: "fritos", ...cento(109), optionGroups: [sabor([{ name: "Carne" }])] },
  { id: "kibe", name: "Kibe", category: "fritos", ...cento(109) },
  {
    id: "risoles", name: "Risoles", category: "fritos", ...cento(109),
    optionGroups: [sabor([
      { name: "Palmito", veg: true },
      { name: "Catupiry", veg: true },
      { name: "Presunto e queijo" },
    ])],
  },
  {
    id: "mini-pastel", name: "Mini Pastel", category: "fritos", ...cento(109),
    optionGroups: [sabor([
      { name: "Carne" }, { name: "Queijo", veg: true }, { name: "Pizza" }, { name: "Frango com catupiry" },
    ])],
  },

  // ============ ASSADOS ============
  { id: "esfiha", name: "Esfiha Fechada", category: "assados", ...cento(149), optionGroups: [sabor([{ name: "Frango" }, { name: "Carne" }])] },
  {
    id: "esfiha-aberta", name: "Esfiha Aberta", category: "assados", ...cento(149),
    optionGroups: [sabor([
      { name: "Queijo com milho", veg: true },
      { name: "Brócolis com queijo", veg: true },
      { name: "Frango com Catupiry" },
      { name: "Tomate seco com ricota", veg: true },
      { name: "Quatro queijos", veg: true },
      { name: "Carne" },
    ])],
  },
  {
    id: "mini-pizza", name: "Mini Pizza", category: "assados", ...cento(149),
    optionGroups: [sabor([
      { name: "Presunto, queijo, tomate e Catupiry" },
      { name: "Calabresa" },
      { name: "Frango cremoso" },
      { name: "Peito de peru" },
    ])],
  },
  {
    id: "enroladinho", name: "Enroladinho", category: "assados", ...cento(149),
    optionGroups: [sabor([
      { name: "Salsicha" }, { name: "Calabresa" }, { name: "Frango cremoso" }, { name: "Presunto e queijo" },
    ])],
  },
  { id: "mini-pao-batata", name: "Mini Pão de Batata com Catupiry", category: "assados", ...cento(149) },
  { id: "mini-hamburguinho", name: "Mini Hamburguinho", category: "assados", ...cento(149), description: "Com batata palha." },
  {
    id: "trouxinha-comum", name: "Trouxinha Comum", category: "assados", ...cento(149),
    optionGroups: [sabor([
      { name: "Palmito", veg: true }, { name: "Calabresa" }, { name: "Frango cremoso" }, { name: "Peito de peru e cheddar" },
    ])],
  },
  {
    id: "empadinha", name: "Empadinha", category: "assados", ...cento(149),
    optionGroups: [sabor([{ name: "Palmito", veg: true }, { name: "Frango cremoso" }])],
  },
  { id: "mini-pao-queijo", name: "Mini Pão de Queijo", category: "assados", ...cento(149) },
  {
    id: "mini-quiche", name: "Mini Quiche", category: "assados", ...cento(149),
    optionGroups: [sabor([
      { name: "Quatro queijos", veg: true },
      { name: "Alho poró com champignon", veg: true },
      { name: "Lorraine (queijo com bacon)" },
    ])],
  },

  // ============ CANAPÉS ============
  {
    id: "canape", name: "Canapé", category: "canapes", ...cento(450),
    description: "Monte seu canapé: escolha a casquinha e a pasta.",
    optionGroups: [
      { label: "1º Escolha a casquinha", min: 1, max: 1, options: [{ name: "Tomate seco" }, { name: "Folhada" }] },
      { label: "2º Escolha a pasta", min: 1, max: 1, options: [
        { name: "Salame" }, { name: "Quatro queijos", veg: true },
        { name: "Tomate seco", veg: true }, { name: "Peito de peru" }, { name: "Azeitonas pretas", veg: true },
      ] },
    ],
  },
  {
    id: "mini-bruschetta", name: "Mini Bruschetta", category: "canapes", ...cento(450),
    optionGroups: [sabor([
      { name: "Cream cheese e pesto de tomate seco", veg: true },
      { name: "Rúcula, queijo minas e geleia de pimenta", veg: true },
      { name: "Cream cheese com tomate confitado e manjericão", veg: true },
    ])],
  },
  { id: "bolo-salgado", name: "Bolo Salgado", category: "canapes", ...kg(69.9), description: "Salpicão de frango entre camadas de pão de forma, decorado com purê e batata palha." },
  {
    id: "torta-salgada", name: "Torta Salgada", category: "canapes", ...un(99),
    description: "Monte sua torta salgada.",
    optionGroups: [
      { label: "1º Escolha a massa", min: 1, max: 1, options: [{ name: "Massa comum" }, { name: "Massa de liquidificador" }, { name: "Massa podre" }] },
      { label: "2º Escolha o recheio", min: 1, max: 1, options: [{ name: "Frango cremoso" }, { name: "Presunto e queijo" }, { name: "Brócolis com queijo", veg: true }] },
    ],
  },
  { id: "rabanada", name: "Rabanada", category: "canapes", ...kg(69.9), description: "Fatias de baguete no leite condensado, fritas e polvilhadas com açúcar e canela." },

  // ============ MINI LANCHES ============
  {
    id: "mini-paes-pate", name: "Mini Pães Recheados com Patê", category: "mini-lanches", ...cento(230),
    optionGroups: [
      { label: "1º Escolha o pão", min: 1, max: 1, options: [
        { name: "Batata" }, { name: "Mandioquinha" }, { name: "Australiano" }, { name: "Francês" }, { name: "Brioche" },
      ] },
      { label: "2º Escolha o patê", min: 1, max: 1, options: [
        { name: "Salpicão de frango" }, { name: "Salame" }, { name: "Quatro queijos", veg: true },
        { name: "Peito de peru" }, { name: "Tomate seco", veg: true }, { name: "Azeitonas pretas", veg: true },
      ] },
    ],
  },
  {
    id: "mini-paes-frios", name: "Mini Pães Recheados com Frios", category: "mini-lanches", ...cento(290),
    description: "Acompanham molho especial, alface, tomate e cenoura ralada.",
    optionGroups: [
      { label: "1º Escolha o pão", min: 1, max: 1, options: [
        { name: "Batata" }, { name: "Mandioquinha" }, { name: "Australiano" }, { name: "Brioche" }, { name: "Francês" }, { name: "Sírio" },
      ] },
      { label: "2º Escolha o embutido", min: 1, max: 1, options: [
        { name: "Salame" }, { name: "Presunto" }, { name: "Copa" }, { name: "Peito de peru" }, { name: "Lombinho" },
      ] },
      { label: "3º Escolha o queijo", min: 1, max: 1, options: [
        { name: "Mussarela" }, { name: "Queijo prato" }, { name: "Gorgonzola" }, { name: "Provolone" }, { name: "Queijo fresco" },
      ] },
    ],
  },
  { id: "mini-hamburger", name: "Lanchinho no Mini Pão de Hambúrger", category: "mini-lanches", ...cento(390), description: "Mini pão de hambúrguer com gergelim, carne, presunto, queijo e alface." },
  { id: "mini-cachorro-quente", name: "Mini Cachorro-Quente", category: "mini-lanches", ...cento(390), description: "Bisnaguinha, meia salsicha em molho, purê e batata palha." },
  { id: "mini-carne-louca", name: "Mini Lanchinho Carne Louca", category: "mini-lanches", ...cento(390) },
  { id: "mini-pernil", name: "Mini Lanchinho Pernil ao Vinagrete", category: "mini-lanches", ...cento(390) },
  { id: "cesta-paes", name: "Cesta de Pães", category: "mini-lanches", ...un(99), description: "10 unidades de cada: mini pão francês com queijo, com gergelim, integral, batata, sírio, australiano e beterraba." },
  {
    id: "paes-italianos-pate", name: "Pães Italianos Recheados com Patê", category: "mini-lanches", ...kg(89),
    optionGroups: [sabor([
      { name: "Salpicão de frango" }, { name: "Salame" }, { name: "Quatro queijos", veg: true },
      { name: "Peito de peru" }, { name: "Tomate seco", veg: true }, { name: "Azeitonas pretas", veg: true },
    ], "Escolha o patê")],
  },
  { id: "tabua-frios", name: "Tábua de Frios", category: "mini-lanches", ...kg(179), description: "Presunto, salames, mortadela defumada, peito de peru, lombinho, mussarela, prato, provolone e gorgonzola, com tomate seco e azeitonas." },

  // ============ BAGUETES ============
  {
    id: "baguete", name: "Baguete Recheada", category: "baguetes", ...kg(69),
    description: "Acompanha molho especial, alface, tomate e cenoura ralada.",
    optionGroups: [
      { label: "1º Escolha a baguete", min: 1, max: 1, options: [
        { name: "Queijo" }, { name: "Tradicional" }, { name: "Australiana" }, { name: "Gergelim" },
      ] },
      { label: "2º Escolha o embutido", min: 1, max: 1, options: [
        { name: "Salame" }, { name: "Copa" }, { name: "Presunto" }, { name: "Peito de peru" }, { name: "Lombinho" },
      ] },
      { label: "3º Escolha o queijo", min: 1, max: 1, options: [
        { name: "Mussarela" }, { name: "Provolone" }, { name: "Queijo prato" }, { name: "Queijo fresco" }, { name: "Gorgonzola" },
      ] },
    ],
  },
  {
    id: "baguete-especial", name: "Baguete Especial", category: "baguetes", ...kg(77),
    optionGroups: [sabor([
      { name: "Australiana com presunto cru, provolone, pasta de gorgonzola, alface e tomate" },
      { name: "Australiana com rúcula, tomate seco e queijo minas", veg: true },
    ])],
  },

  // ============ PIZZAS ============
  { id: "pizza-casa", name: "Pizza À Moda da Casa", category: "pizzas", ...un(54.9), description: "Queijo, palmito, tomate picado, Catupiry, azeitona, azeite e orégano." },
  { id: "pizza-americana", name: "Pizza Americana", category: "pizzas", ...un(54.9), description: "Presunto, queijo, milho, ervilha, ovo, cebola, azeitona, azeite e orégano." },
  { id: "pizza-portuguesa", name: "Pizza Portuguesa", category: "pizzas", ...un(54.9), description: "Presunto, queijo, milho, ervilha, ovo, palmito, tomate, calabresa, cebola, Catupiry, azeitona, azeite e orégano." },
  { id: "pizza-ferrari", name: "Pizza Ferrari", category: "pizzas", ...un(54.9), description: "Queijo, peito de peru, molho de tomate, Catupiry, cebola, azeitona, azeite, palmito e orégano." },
  { id: "pizza-calabresa", name: "Pizza Calabresa", category: "pizzas", ...un(54.9), description: "Queijo, calabresa fatiada, Catupiry, cebola, azeitona, azeite e orégano." },
  { id: "pizza-frango-catupiry", name: "Pizza Frango com Catupiry", category: "pizzas", ...un(54.9), description: "Queijo, frango, riscos de Catupiry, azeitona, azeite e orégano." },
  { id: "pizza-lombinho", name: "Pizza Lombinho", category: "pizzas", ...un(54.9), description: "Queijo, lombinho, tomate picado, Catupiry, azeitona, azeite e orégano." },
  { id: "pizza-brocolis", name: "Pizza Brócolis", category: "pizzas", ...un(54.9), description: "Queijo, brócolis, tomate picado, Catupiry, palmito, azeitona, azeite e orégano." },

  // ============ BOLOS CASEIROS ============
  ...([
    ["Chocolate com Cobertura", 32.9],
    ["Mesclado", 32.9],
    ["Cenoura com Cobertura", 32.9],
    ["Cocada", 32.9],
    ["Banana com Caramelo", 32.9],
    ["Paçoca", 32.9],
    ["Fubá com Goiabada", 32.9],
    ["Mousse de Maracujá", 32.9],
    ["Fubá com Goiabada e Queijo", 32.9],
    ["Mousse de Limão", 32.9],
    ["Prestígio", 32.9],
    ["Maçã com Nozes", 32.9],
    ["Leite Ninho", 32.9],
    ["Picada de Abelha", 32.9],
    ["Laranja", 29.9],
    ["Coco", 29.9],
    ["Fubá", 29.9],
    ["Formigueiro", 29.9],
  ] as [string, number][]).map(([nome, p]) => ({
    id: `bolo-${nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`,
    name: `Bolo ${nome}`, category: "bolos-caseiros" as CategoryId, ...un(p),
  })),
  { id: "placa-cenoura", name: "Placa Bolo de Cenoura", category: "bolos-caseiros", ...un(129) },

  // ============ BOLOS CONFEITADOS ============
  {
    id: "bolo-confeitado", name: "Bolo Confeitado Tradicional", category: "bolos-confeitados", ...kgWhole(99.9),
    description: "Escolha até 2 recheios, a massa e a cobertura.",
    optionGroups: [
      { label: "Recheio (até 2 sabores)", min: 1, max: 2, options: [
        { name: "Leite Ninho com Nutella" }, { name: "Leite Ninho com Morango" }, { name: "Prestígio" },
        { name: "Trufado Branco" }, { name: "Brigadeiro com Morango" }, { name: "Suflair" },
        { name: "Sonho de Valsa" }, { name: "Trufado de Chocolate" },
        { name: "Chocomaracujá (trufado de chocolate com mousse de maracujá)" },
        { name: "Chocolimão (trufado de chocolate com mousse de limão)" },
        { name: "Dois Amores (brigadeiro branco com preto e morango)" },
        { name: "Leite Ninho" }, { name: "Leite Ninho com Abacaxi" }, { name: "Trufado com Morango" },
        { name: "Brigadeiro" }, { name: "Ferrero Rocher" }, { name: "Strogonoff de Nozes" },
        { name: "Ouro Branco" }, { name: "Gelado de Abacaxi" }, { name: "Doce de Leite com Nozes" },
        { name: "Floresta Negra (trufado com cereja)" },
        { name: "Bolo Naty (brigadeiro com morango e creme rico com morango)" },
      ] },
      { label: "Massa", min: 1, max: 1, options: [{ name: "Massa branca" }, { name: "Massa de chocolate" }] },
      { label: "Cobertura", min: 1, max: 1, options: [{ name: "Chantilly" }, { name: "Marshmallow" }, { name: "Naked (bolo pelado)" }] },
    ],
  },
  { id: "bolo-mil-folhas-morango", name: "Bolo Mil Folhas Creme com Morango", category: "bolos-confeitados", ...kgWhole(99.9) },
  { id: "bolo-mil-folhas-trufado", name: "Bolo Mil Folhas Trufado de Chocolate", category: "bolos-confeitados", ...kgWhole(99.9) },
  { id: "bolo-kitkat", name: "Bolo KitKat", category: "bolos-confeitados", ...kgWhole(99.9) },

  // ============ TORTAS ============
  {
    id: "torta-leite-ninho", name: "Torta Leite Ninho", category: "tortas", ...kgWhole(99.9),
    optionGroups: [sabor([
      { name: "Tradicional" }, { name: "Frutas Vermelhas" }, { name: "Nutella" }, { name: "Abacaxi" },
    ])],
  },
  { id: "torta-holandesa", name: "Torta Holandesa", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-ferrero", name: "Torta Ferrero Rocher", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-trufado-chocolate", name: "Torta Trufado de Chocolate", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-trufado-ninho", name: "Torta Trufado com Ninho", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-morangoffe", name: "Torta Morangoffe", category: "tortas", ...kgWhole(99.9), description: "Morango, creme marfim e brigadeiro branco." },
  { id: "torta-banoffee", name: "Torta Banoffee", category: "tortas", ...kgWhole(99.9), description: "Banana, creme marfim e doce de leite." },
  { id: "torta-strogonoff-nozes", name: "Torta Strogonoff de Nozes", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-mousse-cafe", name: "Torta Mousse de Café", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-mousse-nutella", name: "Torta Mousse de Nutella", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-sonho-valsa", name: "Torta Sonho de Valsa", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-ouro-branco", name: "Torta Ouro Branco", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-bis", name: "Torta Bis", category: "tortas", ...kgWhole(99.9) },
  { id: "torta-prestigio", name: "Torta Prestígio com Trufado", category: "tortas", ...kgWhole(99.9) },

  // ============ DOCES ============
  { id: "amor-perfeito", name: "Amor Perfeito", category: "doces", ...cento(390) },
  {
    id: "bombons", name: "Bombons", category: "doces", ...cento(350),
    optionGroups: [sabor([
      { name: "Café" }, { name: "Prestígio" }, { name: "Ferrero Rocher" }, { name: "Trufado" }, { name: "Uva" },
    ])],
  },
  {
    id: "bombons-ninho-nutella", name: "Bombons de Ninho com Nutella", category: "doces", ...cento(350),
    optionGroups: [sabor([{ name: "Tradicional" }, { name: "Perolado" }, { name: "Brigadeiro" }])],
  },
  { id: "cereja-trufada", name: "Cereja Trufada", category: "doces", ...cento(350) },
  {
    id: "carolina", name: "Carolina", category: "doces", ...cento(199),
    optionGroups: [sabor([
      { name: "Doce de Leite" }, { name: "Chocolate" }, { name: "Trufada" }, { name: "Ferrero Rocher" },
      { name: "Mousse de Limão" }, { name: "Mousse de Maracujá" },
    ])],
  },
  {
    id: "mini-bomba", name: "Mini Bomba", category: "doces", ...cento(320),
    optionGroups: [sabor([{ name: "Doce de Leite" }, { name: "Creme" }, { name: "Chocolate" }, { name: "Creme com Morango" }])],
  },
  {
    id: "tortinha", name: "Tortinha", category: "doces", ...cento(290),
    optionGroups: [sabor([
      { name: "Morango" }, { name: "Maracujá" }, { name: "Limão" }, { name: "Maçã" }, { name: "Nozes" }, { name: "Chocolate" },
    ])],
  },
  { id: "mini-queijadinha", name: "Mini Queijadinha", category: "doces", ...cento(250) },
  { id: "mini-pudim", name: "Mini Pudim de Leite Condensado", category: "doces", ...cento(250) },
  { id: "mini-quindim", name: "Mini Quindim", category: "doces", ...cento(250) },
  { id: "cannoli", name: "Cannoli", category: "doces", ...cento(250) },
  {
    id: "mini-mousse", name: "Mini Mousse", category: "doces", ...cento(350),
    optionGroups: [sabor([
      { name: "Trufa com Ninho" }, { name: "Ferrero Rocher" },
      { name: "Brigadeiro Branco com Geleia de Damasco" },
    ])],
  },
  {
    id: "brigadeiro-tradicional", name: "Brigadeiro Tradicional", category: "doces", ...cento(139),
    optionGroups: [sabor([{ name: "Preto (tradicional)" }, { name: "Branco" }, { name: "Beijinho" }, { name: "Caseiro" }])],
  },
  {
    id: "brigadeiro-especial", name: "Brigadeiros Especiais", category: "doces", ...cento(159),
    optionGroups: [sabor([
      { name: "Coco queimado" }, { name: "Branco gourmet" }, { name: "Churros" }, { name: "Bicho de pé" },
      { name: "Gourmet" }, { name: "Romeu e Julieta" }, { name: "Cajuzinho" },
    ])],
  },
  { id: "brigadeiro-colher", name: "Brigadeiro de Colher", category: "doces", ...cento(350) },
  {
    id: "mini-sonho", name: "Mini Sonho", category: "doces", ...cento(189),
    optionGroups: [sabor([{ name: "Creme" }, { name: "Chocolate" }, { name: "Goiabada" }])],
  },
  {
    id: "lua-de-mel", name: "Lua de Mel", category: "doces", ...cento(199),
    optionGroups: [sabor([{ name: "Chocolate" }, { name: "Brigadeiro Branco" }, { name: "Doce de Leite" }, { name: "Creme" }])],
  },
  {
    id: "bolacha-gateau", name: "Bolacha Gateau", category: "doces", ...cento(270),
    optionGroups: [sabor([{ name: "Chocolate" }, { name: "Leite Ninho" }, { name: "Doce de Leite" }])],
  },
  {
    id: "camafeu", name: "Camafeu", category: "doces", ...cento(290),
    optionGroups: [sabor([
      { name: "Tradicional com Fondant" },
      { name: "Coberto com Chocolate ao Leite" },
      { name: "Coberto com Chocolate Branco" },
    ])],
  },

  // ============ ROTISSERIE ============
  { id: "arroz-branco", name: "Arroz Branco", category: "rotisserie", ...kg(33) },
  {
    id: "arroz-especial", name: "Arroz Especial", category: "rotisserie", ...kg(40),
    optionGroups: [sabor([
      { name: "Nozes" }, { name: "Passas" }, { name: "Marrom (bacon, ovo, batata palha e calabresa)" }, { name: "À grega" },
    ])],
  },
  {
    id: "maionese", name: "Maionese", category: "rotisserie", ...kg(40),
    optionGroups: [sabor([{ name: "Legumes" }, { name: "Frango" }])],
  },
  { id: "salpicao", name: "Salpicão de Frango", category: "rotisserie", ...kg(40) },
  { id: "vinagrete", name: "Vinagrete", category: "rotisserie", ...kg(40) },
  { id: "farofa-rica", name: "Farofa Rica", category: "rotisserie", ...kg(40), description: "Bacon, calabresa, cenoura, cebola e tomate." },
  { id: "farofa-agridoce", name: "Farofa Agridoce", category: "rotisserie", ...kg(40), description: "Figo, pêssego e maçã." },
  {
    id: "lasanha", name: "Lasanha", category: "rotisserie", ...kg(45),
    optionGroups: [sabor([
      { name: "Berinjela ao molho bolonhesa" },
      { name: "Peito de peru e queijo ao molho branco" },
    ])],
  },
  {
    id: "rondeli", name: "Rondeli", category: "rotisserie", ...kg(45),
    optionGroups: [sabor([
      { name: "Presunto e queijo ao molho rosé" },
      { name: "Peito de peru ao molho branco" },
      { name: "Frango cremoso ao molho rosé" },
    ])],
  },
  { id: "nhoque", name: "Nhoque ao Molho Sugo", category: "rotisserie", ...kg(45) },
  { id: "lentilha", name: "Lentilha com Calabresa e Bacon", category: "rotisserie", ...kg(45) },
];

export const WHATSAPP_NUMBER = "5519982193443"; // 19 98219-3443
export const INSTAGRAM = "docesonhopadaria_";
export const ENDERECO_LOJA = "Av. Geraldo Gobo, 249 - Santa Cruz, Americana - SP 13477-410";
export const PIX_KEY = "13.665.441/0001-54";
export const PIX_KEY_TYPE = "CNPJ";
export const PIX_BENEFICIARIO = "Doce Sonho Padaria";

// Format helpers
export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export const formatUnitLabel = (u: PriceUnit) =>
  u === "cento" ? "cento (100 un)" : u === "kg" ? "kg" : "unidade";

export const formatQty = (qty: number, unit: PriceUnit) =>
  unit === "kg"
    ? `${qty.toLocaleString("pt-BR", { minimumFractionDigits: qty % 1 === 0 ? 0 : 1, maximumFractionDigits: 3 })} kg`
    : `${qty} un`;

export function itemTotal(product: Product, qty: number): number {
  if (product.unit === "cento") return (product.price / 100) * qty;
  return product.price * qty;
}
