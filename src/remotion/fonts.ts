import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadBebas} from '@remotion/google-fonts/BebasNeue';
import {loadFont as loadCinzel} from '@remotion/google-fonts/Cinzel';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';
import type {FontKey} from './types';

// Only the weight we use, Latin subset (covers á é í ó ú ñ ü ¿ ¡).
const montserrat = loadMontserrat('normal', {weights: ['800'], subsets: ['latin']});
const poppins = loadPoppins('normal', {weights: ['800'], subsets: ['latin']});
const bebas = loadBebas('normal', {weights: ['400'], subsets: ['latin']});
const anton = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const cinzel = loadCinzel('normal', {weights: ['700'], subsets: ['latin']});

export const FONTS: Record<FontKey, {label: string; fontFamily: string; fontWeight: number}> = {
  montserrat: {label: 'Montserrat (TikTok clásico)', fontFamily: montserrat.fontFamily, fontWeight: 800},
  poppins: {label: 'Poppins', fontFamily: poppins.fontFamily, fontWeight: 800},
  bebas: {label: 'Bebas Neue (condensada)', fontFamily: bebas.fontFamily, fontWeight: 400},
  anton: {label: 'Anton (impacto)', fontFamily: anton.fontFamily, fontWeight: 400},
  cinzel: {label: 'Cinzel (épica / histórica)', fontFamily: cinzel.fontFamily, fontWeight: 700},
};
