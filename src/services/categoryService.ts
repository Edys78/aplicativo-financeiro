import { CategoryDef } from '../types';

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'moradia', name: 'Moradia', iconName: 'Home', color: '#3B82F6', isDefault: true, defaultType: 'fixo' },
  { id: 'alimentacao', name: 'Alimentação', iconName: 'Utensils', color: '#10B981', isDefault: true, defaultType: 'variavel' },
  { id: 'agua', name: 'Água', iconName: 'Droplets', color: '#06B6D4', isDefault: true, defaultType: 'fixo' },
  { id: 'energia', name: 'Energia', iconName: 'Zap', color: '#F59E0B', isDefault: true, defaultType: 'fixo' },
  { id: 'internet', name: 'Internet', iconName: 'Wifi', color: '#6366F1', isDefault: true, defaultType: 'fixo' },
  { id: 'telefone', name: 'Telefone', iconName: 'Phone', color: '#8B5CF6', isDefault: true, defaultType: 'fixo' },
  { id: 'transporte', name: 'Transporte', iconName: 'Car', color: '#EC4899', isDefault: true, defaultType: 'variavel' },
  { id: 'saude', name: 'Saúde', iconName: 'HeartPulse', color: '#EF4444', isDefault: true, defaultType: 'fixo' },
  { id: 'educacao', name: 'Educação', iconName: 'GraduationCap', color: '#14B8A6', isDefault: true, defaultType: 'fixo' },
  { id: 'lazer', name: 'Lazer', iconName: 'Smile', color: '#F97316', isDefault: true, defaultType: 'variavel' },
  { id: 'assinaturas', name: 'Assinaturas', iconName: 'Tv', color: '#A855F7', isDefault: true, defaultType: 'fixo' },
  { id: 'compras', name: 'Compras', iconName: 'ShoppingBag', color: '#E11D48', isDefault: true, defaultType: 'variavel' },
  { id: 'impostos', name: 'Impostos', iconName: 'FileText', color: '#64748B', isDefault: true, defaultType: 'fixo' },
  { id: 'outros', name: 'Outros', iconName: 'MoreHorizontal', color: '#94A3B8', isDefault: true, defaultType: 'variavel' },
];

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance / Serviços',
  'Investimentos / Dividendos',
  'Comissões / Vendas',
  'Pensão / Benefício',
  'Outras Rendas',
];

/**
 * Match a raw text category to the closest standard category
 */
export function matchCategory(inputCategory?: string): string {
  if (!inputCategory) return 'Outros';
  const clean = inputCategory.trim().toLowerCase();

  for (const cat of DEFAULT_CATEGORIES) {
    if (cat.name.toLowerCase() === clean) return cat.name;
  }

  // Synonym mappings
  if (clean.includes('alug') || clean.includes('condom') || clean.includes('casa') || clean.includes('iptu') || clean.includes('morad')) return 'Moradia';
  if (clean.includes('supermerc') || clean.includes('mercado') || clean.includes('comida') || clean.includes('restaur') || clean.includes('aliment') || clean.includes('ifood') || clean.includes('lanche')) return 'Alimentação';
  if (clean.includes('agua') || clean.includes('água') || clean.includes('saneam') || clean.includes('sabesp')) return 'Água';
  if (clean.includes('luz') || clean.includes('energ') || clean.includes('enel') || clean.includes('cemig') || clean.includes('copel')) return 'Energia';
  if (clean.includes('net') || clean.includes('fibra') || clean.includes('inter') || clean.includes('wifi')) return 'Internet';
  if (clean.includes('vivo') || clean.includes('claro') || clean.includes('tim') || clean.includes('celular') || clean.includes('tel')) return 'Telefone';
  if (clean.includes('uber') || clean.includes('gasolin') || clean.includes('combust') || clean.includes('onibus') || clean.includes('ônibus') || clean.includes('metro') || clean.includes('metrô') || clean.includes('transp') || clean.includes('estacion')) return 'Transporte';
  if (clean.includes('farm') || clean.includes('medic') || clean.includes('médic') || clean.includes('hospital') || clean.includes('saud') || clean.includes('saúd') || clean.includes('dentist') || clean.includes('plano de sa')) return 'Saúde';
  if (clean.includes('escola') || clean.includes('faculd') || clean.includes('curso') || clean.includes('livro') || clean.includes('educa')) return 'Educação';
  if (clean.includes('cinema') || clean.includes('festa') || clean.includes('viagem') || clean.includes('bar') || clean.includes('show') || clean.includes('lazer') || clean.includes('jogos')) return 'Lazer';
  if (clean.includes('netflix') || clean.includes('spotify') || clean.includes('prime') || clean.includes('disney') || clean.includes('stream') || clean.includes('assinat') || clean.includes('hbo') || clean.includes('max')) return 'Assinaturas';
  if (clean.includes('roupa') || clean.includes('sapato') || clean.includes('compra') || clean.includes('shopping') || clean.includes('eletron') || clean.includes('eletrôn')) return 'Compras';
  if (clean.includes('impost') || clean.includes('darf') || clean.includes('das') || clean.includes('taxa') || clean.includes('irpf') || clean.includes('tribut')) return 'Impostos';

  return inputCategory.charAt(0).toUpperCase() + inputCategory.slice(1);
}

/**
 * Get category color by name
 */
export function getCategoryColor(categoryName: string): string {
  const found = DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.color : '#64748B';
}
