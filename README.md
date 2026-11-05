# Portfólio — versão 3

Reconstrução da página pós-START com estrutura inspirada na referência [cristophermartins.com](https://cristophermartins.com/): apresentação pessoal, últimos trabalhos, stacks, sobre, serviços e contato.

**A tela START é idêntica à original**: o mesmo fragmento HTML de `portfolio-arcade/index.html` e o mesmo arquivo `style.css` são preservados sem mudanças. A nova página está nos arquivos `reference.css`, `index.html` (somente depois de START) e `app.js`.

## Para abrir

Abra `index.html` no navegador, ou rode `python -m http.server 8000` dentro da pasta e abra http://localhost:8000.

## Para personalizar

- Abra `content.js` e altere nome, profissão, texto, links e projetos.
- Suas fotos estão em `assets/portrait-close.png` (capa) e `assets/portrait-full.png` (sobre).
- Para colocar seus próprios projetos na galeria, adicione imagens na pasta `assets/` e informe `image: 'assets/arquivo.webp'` na lista `projects` de `content.js`. Adicione título e URL.
- As quatro capas atuais **não são projetos reais**: são layouts demonstrativos originais, marcados como tal.
- Coloque seu e-mail em `content.js` para habilitar o link de contato.

Este projeto é HTML/CSS/JavaScript independente, sem bibliotecas externas. Não é uma cópia do código proprietário do site de referência.
