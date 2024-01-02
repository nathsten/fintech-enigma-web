/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  sidebarSider: [
    {
      type: 'category',
      label: 'Om Fintech Enigma',
      items: ['Om Fintech Enigma', 'Investeringsfilosofi'],
    },
    {
      type: 'category',
      label: 'Porteføljeoversikt',
      items: ['Nordnetportefolje', 'Fondsforvaltning og Algoritmisk trading', 'Algoritmeportefolje'],
    },
    {
      type: 'category',
      label: 'Aksjeanalyser',
      items: ['Portefoljeanalyse010124']
    },
    {
      type: 'category',
      label: 'For Studenter',
      items: ['Bli_med_i_Fintech'],
    },
    {
      type: 'category',
      label: 'Hovedstyret',
      items: ['Styret 2023 2024', 'Styret 2022 2023'], 
    },
    {
      type: 'category',
      label: 'Medlemmer',
      items: ['Medlemmer 23 24' ,'Medlemmer 22 23'],
    },
    {
      type: 'category',
      label: 'For Bedrifter',
      items: ['Bedriftpresentasjoner','Prisliste Fintech Enigma 2023' ,'Kontakt_oss'],
    }
  ],
};
module.exports = sidebars;
