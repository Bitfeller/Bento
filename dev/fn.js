const gca = (n, el) => (el ?? document).getElementsByClassName(n);
const gc = (n, el) => gca(n, el)[0];
const gid = (n) => document.getElementById(n);
const newEl = (t) => document.createElement(t);