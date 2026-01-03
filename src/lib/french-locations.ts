// All French departments and major cities for SEO

export interface Department {
  code: string;
  name: string;
  region: string;
  slug: string;
  cities: City[];
}

export interface City {
  name: string;
  slug: string;
  population?: number;
}

export const frenchDepartments: Department[] = [
  { code: "01", name: "Ain", region: "Auvergne-Rhône-Alpes", slug: "ain", cities: [
    { name: "Bourg-en-Bresse", slug: "bourg-en-bresse" },
    { name: "Oyonnax", slug: "oyonnax" },
    { name: "Ambérieu-en-Bugey", slug: "amberieu-en-bugey" },
  ]},
  { code: "02", name: "Aisne", region: "Hauts-de-France", slug: "aisne", cities: [
    { name: "Saint-Quentin", slug: "saint-quentin" },
    { name: "Laon", slug: "laon" },
    { name: "Soissons", slug: "soissons" },
  ]},
  { code: "03", name: "Allier", region: "Auvergne-Rhône-Alpes", slug: "allier", cities: [
    { name: "Montluçon", slug: "montlucon" },
    { name: "Vichy", slug: "vichy" },
    { name: "Moulins", slug: "moulins" },
  ]},
  { code: "04", name: "Alpes-de-Haute-Provence", region: "Provence-Alpes-Côte d'Azur", slug: "alpes-de-haute-provence", cities: [
    { name: "Digne-les-Bains", slug: "digne-les-bains" },
    { name: "Manosque", slug: "manosque" },
    { name: "Sisteron", slug: "sisteron" },
  ]},
  { code: "05", name: "Hautes-Alpes", region: "Provence-Alpes-Côte d'Azur", slug: "hautes-alpes", cities: [
    { name: "Gap", slug: "gap" },
    { name: "Briançon", slug: "briancon" },
    { name: "Embrun", slug: "embrun" },
  ]},
  { code: "06", name: "Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur", slug: "alpes-maritimes", cities: [
    { name: "Nice", slug: "nice" },
    { name: "Cannes", slug: "cannes" },
    { name: "Antibes", slug: "antibes" },
    { name: "Grasse", slug: "grasse" },
  ]},
  { code: "07", name: "Ardèche", region: "Auvergne-Rhône-Alpes", slug: "ardeche", cities: [
    { name: "Annonay", slug: "annonay" },
    { name: "Aubenas", slug: "aubenas" },
    { name: "Privas", slug: "privas" },
  ]},
  { code: "08", name: "Ardennes", region: "Grand Est", slug: "ardennes", cities: [
    { name: "Charleville-Mézières", slug: "charleville-mezieres" },
    { name: "Sedan", slug: "sedan" },
    { name: "Rethel", slug: "rethel" },
  ]},
  { code: "09", name: "Ariège", region: "Occitanie", slug: "ariege", cities: [
    { name: "Pamiers", slug: "pamiers" },
    { name: "Foix", slug: "foix" },
    { name: "Saint-Girons", slug: "saint-girons" },
  ]},
  { code: "10", name: "Aube", region: "Grand Est", slug: "aube", cities: [
    { name: "Troyes", slug: "troyes" },
    { name: "Romilly-sur-Seine", slug: "romilly-sur-seine" },
    { name: "Bar-sur-Aube", slug: "bar-sur-aube" },
  ]},
  { code: "11", name: "Aude", region: "Occitanie", slug: "aude", cities: [
    { name: "Carcassonne", slug: "carcassonne" },
    { name: "Narbonne", slug: "narbonne" },
    { name: "Castelnaudary", slug: "castelnaudary" },
  ]},
  { code: "12", name: "Aveyron", region: "Occitanie", slug: "aveyron", cities: [
    { name: "Rodez", slug: "rodez" },
    { name: "Millau", slug: "millau" },
    { name: "Villefranche-de-Rouergue", slug: "villefranche-de-rouergue" },
  ]},
  { code: "13", name: "Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur", slug: "bouches-du-rhone", cities: [
    { name: "Marseille", slug: "marseille" },
    { name: "Aix-en-Provence", slug: "aix-en-provence" },
    { name: "Arles", slug: "arles" },
    { name: "Martigues", slug: "martigues" },
  ]},
  { code: "14", name: "Calvados", region: "Normandie", slug: "calvados", cities: [
    { name: "Caen", slug: "caen" },
    { name: "Lisieux", slug: "lisieux" },
    { name: "Bayeux", slug: "bayeux" },
    { name: "Honfleur", slug: "honfleur" },
  ]},
  { code: "15", name: "Cantal", region: "Auvergne-Rhône-Alpes", slug: "cantal", cities: [
    { name: "Aurillac", slug: "aurillac" },
    { name: "Saint-Flour", slug: "saint-flour" },
    { name: "Mauriac", slug: "mauriac" },
  ]},
  { code: "16", name: "Charente", region: "Nouvelle-Aquitaine", slug: "charente", cities: [
    { name: "Angoulême", slug: "angouleme" },
    { name: "Cognac", slug: "cognac" },
    { name: "Soyaux", slug: "soyaux" },
  ]},
  { code: "17", name: "Charente-Maritime", region: "Nouvelle-Aquitaine", slug: "charente-maritime", cities: [
    { name: "La Rochelle", slug: "la-rochelle" },
    { name: "Saintes", slug: "saintes" },
    { name: "Rochefort", slug: "rochefort" },
    { name: "Royan", slug: "royan" },
  ]},
  { code: "18", name: "Cher", region: "Centre-Val de Loire", slug: "cher", cities: [
    { name: "Bourges", slug: "bourges" },
    { name: "Vierzon", slug: "vierzon" },
    { name: "Saint-Amand-Montrond", slug: "saint-amand-montrond" },
  ]},
  { code: "19", name: "Corrèze", region: "Nouvelle-Aquitaine", slug: "correze", cities: [
    { name: "Brive-la-Gaillarde", slug: "brive-la-gaillarde" },
    { name: "Tulle", slug: "tulle" },
    { name: "Ussel", slug: "ussel" },
  ]},
  { code: "21", name: "Côte-d'Or", region: "Bourgogne-Franche-Comté", slug: "cote-d-or", cities: [
    { name: "Dijon", slug: "dijon" },
    { name: "Beaune", slug: "beaune" },
    { name: "Chenôve", slug: "chenove" },
  ]},
  { code: "22", name: "Côtes-d'Armor", region: "Bretagne", slug: "cotes-d-armor", cities: [
    { name: "Saint-Brieuc", slug: "saint-brieuc" },
    { name: "Lannion", slug: "lannion" },
    { name: "Dinan", slug: "dinan" },
  ]},
  { code: "23", name: "Creuse", region: "Nouvelle-Aquitaine", slug: "creuse", cities: [
    { name: "Guéret", slug: "gueret" },
    { name: "La Souterraine", slug: "la-souterraine" },
    { name: "Aubusson", slug: "aubusson" },
  ]},
  { code: "24", name: "Dordogne", region: "Nouvelle-Aquitaine", slug: "dordogne", cities: [
    { name: "Périgueux", slug: "perigueux" },
    { name: "Bergerac", slug: "bergerac" },
    { name: "Sarlat-la-Canéda", slug: "sarlat-la-caneda" },
  ]},
  { code: "25", name: "Doubs", region: "Bourgogne-Franche-Comté", slug: "doubs", cities: [
    { name: "Besançon", slug: "besancon" },
    { name: "Montbéliard", slug: "montbeliard" },
    { name: "Pontarlier", slug: "pontarlier" },
  ]},
  { code: "26", name: "Drôme", region: "Auvergne-Rhône-Alpes", slug: "drome", cities: [
    { name: "Valence", slug: "valence" },
    { name: "Montélimar", slug: "montelimar" },
    { name: "Romans-sur-Isère", slug: "romans-sur-isere" },
  ]},
  { code: "27", name: "Eure", region: "Normandie", slug: "eure", cities: [
    { name: "Évreux", slug: "evreux" },
    { name: "Vernon", slug: "vernon" },
    { name: "Louviers", slug: "louviers" },
  ]},
  { code: "28", name: "Eure-et-Loir", region: "Centre-Val de Loire", slug: "eure-et-loir", cities: [
    { name: "Chartres", slug: "chartres" },
    { name: "Dreux", slug: "dreux" },
    { name: "Châteaudun", slug: "chateaudun" },
  ]},
  { code: "29", name: "Finistère", region: "Bretagne", slug: "finistere", cities: [
    { name: "Brest", slug: "brest" },
    { name: "Quimper", slug: "quimper" },
    { name: "Morlaix", slug: "morlaix" },
    { name: "Concarneau", slug: "concarneau" },
  ]},
  { code: "2A", name: "Corse-du-Sud", region: "Corse", slug: "corse-du-sud", cities: [
    { name: "Ajaccio", slug: "ajaccio" },
    { name: "Porto-Vecchio", slug: "porto-vecchio" },
    { name: "Propriano", slug: "propriano" },
  ]},
  { code: "2B", name: "Haute-Corse", region: "Corse", slug: "haute-corse", cities: [
    { name: "Bastia", slug: "bastia" },
    { name: "Corte", slug: "corte" },
    { name: "Calvi", slug: "calvi" },
  ]},
  { code: "30", name: "Gard", region: "Occitanie", slug: "gard", cities: [
    { name: "Nîmes", slug: "nimes" },
    { name: "Alès", slug: "ales" },
    { name: "Bagnols-sur-Cèze", slug: "bagnols-sur-ceze" },
  ]},
  { code: "31", name: "Haute-Garonne", region: "Occitanie", slug: "haute-garonne", cities: [
    { name: "Toulouse", slug: "toulouse" },
    { name: "Colomiers", slug: "colomiers" },
    { name: "Tournefeuille", slug: "tournefeuille" },
    { name: "Muret", slug: "muret" },
  ]},
  { code: "32", name: "Gers", region: "Occitanie", slug: "gers", cities: [
    { name: "Auch", slug: "auch" },
    { name: "Condom", slug: "condom" },
    { name: "L'Isle-Jourdain", slug: "l-isle-jourdain" },
  ]},
  { code: "33", name: "Gironde", region: "Nouvelle-Aquitaine", slug: "gironde", cities: [
    { name: "Bordeaux", slug: "bordeaux" },
    { name: "Mérignac", slug: "merignac" },
    { name: "Pessac", slug: "pessac" },
    { name: "Arcachon", slug: "arcachon" },
  ]},
  { code: "34", name: "Hérault", region: "Occitanie", slug: "herault", cities: [
    { name: "Montpellier", slug: "montpellier" },
    { name: "Béziers", slug: "beziers" },
    { name: "Sète", slug: "sete" },
    { name: "Agde", slug: "agde" },
  ]},
  { code: "35", name: "Ille-et-Vilaine", region: "Bretagne", slug: "ille-et-vilaine", cities: [
    { name: "Rennes", slug: "rennes" },
    { name: "Saint-Malo", slug: "saint-malo" },
    { name: "Fougères", slug: "fougeres" },
    { name: "Vitré", slug: "vitre" },
  ]},
  { code: "36", name: "Indre", region: "Centre-Val de Loire", slug: "indre", cities: [
    { name: "Châteauroux", slug: "chateauroux" },
    { name: "Issoudun", slug: "issoudun" },
    { name: "Le Blanc", slug: "le-blanc" },
  ]},
  { code: "37", name: "Indre-et-Loire", region: "Centre-Val de Loire", slug: "indre-et-loire", cities: [
    { name: "Tours", slug: "tours" },
    { name: "Joué-lès-Tours", slug: "joue-les-tours" },
    { name: "Amboise", slug: "amboise" },
    { name: "Chinon", slug: "chinon" },
  ]},
  { code: "38", name: "Isère", region: "Auvergne-Rhône-Alpes", slug: "isere", cities: [
    { name: "Grenoble", slug: "grenoble" },
    { name: "Vienne", slug: "vienne" },
    { name: "Bourgoin-Jallieu", slug: "bourgoin-jallieu" },
    { name: "Voiron", slug: "voiron" },
  ]},
  { code: "39", name: "Jura", region: "Bourgogne-Franche-Comté", slug: "jura", cities: [
    { name: "Lons-le-Saunier", slug: "lons-le-saunier" },
    { name: "Dole", slug: "dole" },
    { name: "Saint-Claude", slug: "saint-claude" },
  ]},
  { code: "40", name: "Landes", region: "Nouvelle-Aquitaine", slug: "landes", cities: [
    { name: "Mont-de-Marsan", slug: "mont-de-marsan" },
    { name: "Dax", slug: "dax" },
    { name: "Biscarrosse", slug: "biscarrosse" },
  ]},
  { code: "41", name: "Loir-et-Cher", region: "Centre-Val de Loire", slug: "loir-et-cher", cities: [
    { name: "Blois", slug: "blois" },
    { name: "Vendôme", slug: "vendome" },
    { name: "Romorantin-Lanthenay", slug: "romorantin-lanthenay" },
  ]},
  { code: "42", name: "Loire", region: "Auvergne-Rhône-Alpes", slug: "loire", cities: [
    { name: "Saint-Étienne", slug: "saint-etienne" },
    { name: "Roanne", slug: "roanne" },
    { name: "Montbrison", slug: "montbrison" },
  ]},
  { code: "43", name: "Haute-Loire", region: "Auvergne-Rhône-Alpes", slug: "haute-loire", cities: [
    { name: "Le Puy-en-Velay", slug: "le-puy-en-velay" },
    { name: "Monistrol-sur-Loire", slug: "monistrol-sur-loire" },
    { name: "Brioude", slug: "brioude" },
  ]},
  { code: "44", name: "Loire-Atlantique", region: "Pays de la Loire", slug: "loire-atlantique", cities: [
    { name: "Nantes", slug: "nantes" },
    { name: "Saint-Nazaire", slug: "saint-nazaire" },
    { name: "Rezé", slug: "reze" },
    { name: "La Baule-Escoublac", slug: "la-baule-escoublac" },
  ]},
  { code: "45", name: "Loiret", region: "Centre-Val de Loire", slug: "loiret", cities: [
    { name: "Orléans", slug: "orleans" },
    { name: "Montargis", slug: "montargis" },
    { name: "Fleury-les-Aubrais", slug: "fleury-les-aubrais" },
  ]},
  { code: "46", name: "Lot", region: "Occitanie", slug: "lot", cities: [
    { name: "Cahors", slug: "cahors" },
    { name: "Figeac", slug: "figeac" },
    { name: "Gourdon", slug: "gourdon" },
  ]},
  { code: "47", name: "Lot-et-Garonne", region: "Nouvelle-Aquitaine", slug: "lot-et-garonne", cities: [
    { name: "Agen", slug: "agen" },
    { name: "Villeneuve-sur-Lot", slug: "villeneuve-sur-lot" },
    { name: "Marmande", slug: "marmande" },
  ]},
  { code: "48", name: "Lozère", region: "Occitanie", slug: "lozere", cities: [
    { name: "Mende", slug: "mende" },
    { name: "Marvejols", slug: "marvejols" },
    { name: "Saint-Chély-d'Apcher", slug: "saint-chely-d-apcher" },
  ]},
  { code: "49", name: "Maine-et-Loire", region: "Pays de la Loire", slug: "maine-et-loire", cities: [
    { name: "Angers", slug: "angers" },
    { name: "Cholet", slug: "cholet" },
    { name: "Saumur", slug: "saumur" },
  ]},
  { code: "50", name: "Manche", region: "Normandie", slug: "manche", cities: [
    { name: "Cherbourg-en-Cotentin", slug: "cherbourg-en-cotentin" },
    { name: "Saint-Lô", slug: "saint-lo" },
    { name: "Granville", slug: "granville" },
  ]},
  { code: "51", name: "Marne", region: "Grand Est", slug: "marne", cities: [
    { name: "Reims", slug: "reims" },
    { name: "Châlons-en-Champagne", slug: "chalons-en-champagne" },
    { name: "Épernay", slug: "epernay" },
  ]},
  { code: "52", name: "Haute-Marne", region: "Grand Est", slug: "haute-marne", cities: [
    { name: "Chaumont", slug: "chaumont" },
    { name: "Saint-Dizier", slug: "saint-dizier" },
    { name: "Langres", slug: "langres" },
  ]},
  { code: "53", name: "Mayenne", region: "Pays de la Loire", slug: "mayenne", cities: [
    { name: "Laval", slug: "laval" },
    { name: "Mayenne", slug: "mayenne" },
    { name: "Château-Gontier", slug: "chateau-gontier" },
  ]},
  { code: "54", name: "Meurthe-et-Moselle", region: "Grand Est", slug: "meurthe-et-moselle", cities: [
    { name: "Nancy", slug: "nancy" },
    { name: "Vandœuvre-lès-Nancy", slug: "vandoeuvre-les-nancy" },
    { name: "Lunéville", slug: "luneville" },
  ]},
  { code: "55", name: "Meuse", region: "Grand Est", slug: "meuse", cities: [
    { name: "Bar-le-Duc", slug: "bar-le-duc" },
    { name: "Verdun", slug: "verdun" },
    { name: "Commercy", slug: "commercy" },
  ]},
  { code: "56", name: "Morbihan", region: "Bretagne", slug: "morbihan", cities: [
    { name: "Lorient", slug: "lorient" },
    { name: "Vannes", slug: "vannes" },
    { name: "Lanester", slug: "lanester" },
    { name: "Auray", slug: "auray" },
  ]},
  { code: "57", name: "Moselle", region: "Grand Est", slug: "moselle", cities: [
    { name: "Metz", slug: "metz" },
    { name: "Thionville", slug: "thionville" },
    { name: "Forbach", slug: "forbach" },
    { name: "Sarreguemines", slug: "sarreguemines" },
  ]},
  { code: "58", name: "Nièvre", region: "Bourgogne-Franche-Comté", slug: "nievre", cities: [
    { name: "Nevers", slug: "nevers" },
    { name: "Cosne-Cours-sur-Loire", slug: "cosne-cours-sur-loire" },
    { name: "Decize", slug: "decize" },
  ]},
  { code: "59", name: "Nord", region: "Hauts-de-France", slug: "nord", cities: [
    { name: "Lille", slug: "lille" },
    { name: "Roubaix", slug: "roubaix" },
    { name: "Tourcoing", slug: "tourcoing" },
    { name: "Dunkerque", slug: "dunkerque" },
    { name: "Valenciennes", slug: "valenciennes" },
  ]},
  { code: "60", name: "Oise", region: "Hauts-de-France", slug: "oise", cities: [
    { name: "Beauvais", slug: "beauvais" },
    { name: "Compiègne", slug: "compiegne" },
    { name: "Creil", slug: "creil" },
    { name: "Senlis", slug: "senlis" },
  ]},
  { code: "61", name: "Orne", region: "Normandie", slug: "orne", cities: [
    { name: "Alençon", slug: "alencon" },
    { name: "Flers", slug: "flers" },
    { name: "Argentan", slug: "argentan" },
  ]},
  { code: "62", name: "Pas-de-Calais", region: "Hauts-de-France", slug: "pas-de-calais", cities: [
    { name: "Calais", slug: "calais" },
    { name: "Boulogne-sur-Mer", slug: "boulogne-sur-mer" },
    { name: "Arras", slug: "arras" },
    { name: "Lens", slug: "lens" },
    { name: "Liévin", slug: "lievin" },
  ]},
  { code: "63", name: "Puy-de-Dôme", region: "Auvergne-Rhône-Alpes", slug: "puy-de-dome", cities: [
    { name: "Clermont-Ferrand", slug: "clermont-ferrand" },
    { name: "Cournon-d'Auvergne", slug: "cournon-d-auvergne" },
    { name: "Riom", slug: "riom" },
    { name: "Issoire", slug: "issoire" },
  ]},
  { code: "64", name: "Pyrénées-Atlantiques", region: "Nouvelle-Aquitaine", slug: "pyrenees-atlantiques", cities: [
    { name: "Pau", slug: "pau" },
    { name: "Bayonne", slug: "bayonne" },
    { name: "Anglet", slug: "anglet" },
    { name: "Biarritz", slug: "biarritz" },
  ]},
  { code: "65", name: "Hautes-Pyrénées", region: "Occitanie", slug: "hautes-pyrenees", cities: [
    { name: "Tarbes", slug: "tarbes" },
    { name: "Lourdes", slug: "lourdes" },
    { name: "Bagnères-de-Bigorre", slug: "bagneres-de-bigorre" },
  ]},
  { code: "66", name: "Pyrénées-Orientales", region: "Occitanie", slug: "pyrenees-orientales", cities: [
    { name: "Perpignan", slug: "perpignan" },
    { name: "Canet-en-Roussillon", slug: "canet-en-roussillon" },
    { name: "Saint-Estève", slug: "saint-esteve" },
  ]},
  { code: "67", name: "Bas-Rhin", region: "Grand Est", slug: "bas-rhin", cities: [
    { name: "Strasbourg", slug: "strasbourg" },
    { name: "Haguenau", slug: "haguenau" },
    { name: "Schiltigheim", slug: "schiltigheim" },
    { name: "Illkirch-Graffenstaden", slug: "illkirch-graffenstaden" },
  ]},
  { code: "68", name: "Haut-Rhin", region: "Grand Est", slug: "haut-rhin", cities: [
    { name: "Mulhouse", slug: "mulhouse" },
    { name: "Colmar", slug: "colmar" },
    { name: "Saint-Louis", slug: "saint-louis" },
  ]},
  { code: "69", name: "Rhône", region: "Auvergne-Rhône-Alpes", slug: "rhone", cities: [
    { name: "Lyon", slug: "lyon" },
    { name: "Villeurbanne", slug: "villeurbanne" },
    { name: "Vénissieux", slug: "venissieux" },
    { name: "Vaulx-en-Velin", slug: "vaulx-en-velin" },
  ]},
  { code: "70", name: "Haute-Saône", region: "Bourgogne-Franche-Comté", slug: "haute-saone", cities: [
    { name: "Vesoul", slug: "vesoul" },
    { name: "Héricourt", slug: "hericourt" },
    { name: "Lure", slug: "lure" },
  ]},
  { code: "71", name: "Saône-et-Loire", region: "Bourgogne-Franche-Comté", slug: "saone-et-loire", cities: [
    { name: "Chalon-sur-Saône", slug: "chalon-sur-saone" },
    { name: "Mâcon", slug: "macon" },
    { name: "Le Creusot", slug: "le-creusot" },
    { name: "Autun", slug: "autun" },
  ]},
  { code: "72", name: "Sarthe", region: "Pays de la Loire", slug: "sarthe", cities: [
    { name: "Le Mans", slug: "le-mans" },
    { name: "La Flèche", slug: "la-fleche" },
    { name: "Sablé-sur-Sarthe", slug: "sable-sur-sarthe" },
  ]},
  { code: "73", name: "Savoie", region: "Auvergne-Rhône-Alpes", slug: "savoie", cities: [
    { name: "Chambéry", slug: "chambery" },
    { name: "Aix-les-Bains", slug: "aix-les-bains" },
    { name: "Albertville", slug: "albertville" },
  ]},
  { code: "74", name: "Haute-Savoie", region: "Auvergne-Rhône-Alpes", slug: "haute-savoie", cities: [
    { name: "Annecy", slug: "annecy" },
    { name: "Thonon-les-Bains", slug: "thonon-les-bains" },
    { name: "Annemasse", slug: "annemasse" },
    { name: "Chamonix-Mont-Blanc", slug: "chamonix-mont-blanc" },
  ]},
  { code: "75", name: "Paris", region: "Île-de-France", slug: "paris", cities: [
    { name: "Paris", slug: "paris" },
  ]},
  { code: "76", name: "Seine-Maritime", region: "Normandie", slug: "seine-maritime", cities: [
    { name: "Le Havre", slug: "le-havre" },
    { name: "Rouen", slug: "rouen" },
    { name: "Dieppe", slug: "dieppe" },
    { name: "Fécamp", slug: "fecamp" },
  ]},
  { code: "77", name: "Seine-et-Marne", region: "Île-de-France", slug: "seine-et-marne", cities: [
    { name: "Meaux", slug: "meaux" },
    { name: "Chelles", slug: "chelles" },
    { name: "Melun", slug: "melun" },
    { name: "Pontault-Combault", slug: "pontault-combault" },
  ]},
  { code: "78", name: "Yvelines", region: "Île-de-France", slug: "yvelines", cities: [
    { name: "Versailles", slug: "versailles" },
    { name: "Saint-Germain-en-Laye", slug: "saint-germain-en-laye" },
    { name: "Mantes-la-Jolie", slug: "mantes-la-jolie" },
    { name: "Poissy", slug: "poissy" },
  ]},
  { code: "79", name: "Deux-Sèvres", region: "Nouvelle-Aquitaine", slug: "deux-sevres", cities: [
    { name: "Niort", slug: "niort" },
    { name: "Bressuire", slug: "bressuire" },
    { name: "Parthenay", slug: "parthenay" },
  ]},
  { code: "80", name: "Somme", region: "Hauts-de-France", slug: "somme", cities: [
    { name: "Amiens", slug: "amiens" },
    { name: "Abbeville", slug: "abbeville" },
    { name: "Albert", slug: "albert" },
  ]},
  { code: "81", name: "Tarn", region: "Occitanie", slug: "tarn", cities: [
    { name: "Albi", slug: "albi" },
    { name: "Castres", slug: "castres" },
    { name: "Gaillac", slug: "gaillac" },
  ]},
  { code: "82", name: "Tarn-et-Garonne", region: "Occitanie", slug: "tarn-et-garonne", cities: [
    { name: "Montauban", slug: "montauban" },
    { name: "Castelsarrasin", slug: "castelsarrasin" },
    { name: "Moissac", slug: "moissac" },
  ]},
  { code: "83", name: "Var", region: "Provence-Alpes-Côte d'Azur", slug: "var", cities: [
    { name: "Toulon", slug: "toulon" },
    { name: "Fréjus", slug: "frejus" },
    { name: "Hyères", slug: "hyeres" },
    { name: "Saint-Raphaël", slug: "saint-raphael" },
  ]},
  { code: "84", name: "Vaucluse", region: "Provence-Alpes-Côte d'Azur", slug: "vaucluse", cities: [
    { name: "Avignon", slug: "avignon" },
    { name: "Orange", slug: "orange" },
    { name: "Carpentras", slug: "carpentras" },
    { name: "Cavaillon", slug: "cavaillon" },
  ]},
  { code: "85", name: "Vendée", region: "Pays de la Loire", slug: "vendee", cities: [
    { name: "La Roche-sur-Yon", slug: "la-roche-sur-yon" },
    { name: "Les Sables-d'Olonne", slug: "les-sables-d-olonne" },
    { name: "Challans", slug: "challans" },
  ]},
  { code: "86", name: "Vienne", region: "Nouvelle-Aquitaine", slug: "vienne", cities: [
    { name: "Poitiers", slug: "poitiers" },
    { name: "Châtellerault", slug: "chatellerault" },
    { name: "Buxerolles", slug: "buxerolles" },
  ]},
  { code: "87", name: "Haute-Vienne", region: "Nouvelle-Aquitaine", slug: "haute-vienne", cities: [
    { name: "Limoges", slug: "limoges" },
    { name: "Saint-Junien", slug: "saint-junien" },
    { name: "Panazol", slug: "panazol" },
  ]},
  { code: "88", name: "Vosges", region: "Grand Est", slug: "vosges", cities: [
    { name: "Épinal", slug: "epinal" },
    { name: "Saint-Dié-des-Vosges", slug: "saint-die-des-vosges" },
    { name: "Gérardmer", slug: "gerardmer" },
    { name: "Remiremont", slug: "remiremont" },
  ]},
  { code: "89", name: "Yonne", region: "Bourgogne-Franche-Comté", slug: "yonne", cities: [
    { name: "Auxerre", slug: "auxerre" },
    { name: "Sens", slug: "sens" },
    { name: "Joigny", slug: "joigny" },
  ]},
  { code: "90", name: "Territoire de Belfort", region: "Bourgogne-Franche-Comté", slug: "territoire-de-belfort", cities: [
    { name: "Belfort", slug: "belfort" },
    { name: "Delle", slug: "delle" },
  ]},
  { code: "91", name: "Essonne", region: "Île-de-France", slug: "essonne", cities: [
    { name: "Évry-Courcouronnes", slug: "evry-courcouronnes" },
    { name: "Corbeil-Essonnes", slug: "corbeil-essonnes" },
    { name: "Massy", slug: "massy" },
    { name: "Savigny-sur-Orge", slug: "savigny-sur-orge" },
  ]},
  { code: "92", name: "Hauts-de-Seine", region: "Île-de-France", slug: "hauts-de-seine", cities: [
    { name: "Boulogne-Billancourt", slug: "boulogne-billancourt" },
    { name: "Nanterre", slug: "nanterre" },
    { name: "Courbevoie", slug: "courbevoie" },
    { name: "Colombes", slug: "colombes" },
    { name: "La Défense", slug: "la-defense" },
  ]},
  { code: "93", name: "Seine-Saint-Denis", region: "Île-de-France", slug: "seine-saint-denis", cities: [
    { name: "Saint-Denis", slug: "saint-denis" },
    { name: "Montreuil", slug: "montreuil" },
    { name: "Aubervilliers", slug: "aubervilliers" },
    { name: "Aulnay-sous-Bois", slug: "aulnay-sous-bois" },
  ]},
  { code: "94", name: "Val-de-Marne", region: "Île-de-France", slug: "val-de-marne", cities: [
    { name: "Créteil", slug: "creteil" },
    { name: "Vitry-sur-Seine", slug: "vitry-sur-seine" },
    { name: "Champigny-sur-Marne", slug: "champigny-sur-marne" },
    { name: "Saint-Maur-des-Fossés", slug: "saint-maur-des-fosses" },
  ]},
  { code: "95", name: "Val-d'Oise", region: "Île-de-France", slug: "val-d-oise", cities: [
    { name: "Argenteuil", slug: "argenteuil" },
    { name: "Cergy", slug: "cergy" },
    { name: "Sarcelles", slug: "sarcelles" },
    { name: "Pontoise", slug: "pontoise" },
  ]},
  // DOM-TOM
  { code: "971", name: "Guadeloupe", region: "Guadeloupe", slug: "guadeloupe", cities: [
    { name: "Pointe-à-Pitre", slug: "pointe-a-pitre" },
    { name: "Les Abymes", slug: "les-abymes" },
    { name: "Baie-Mahault", slug: "baie-mahault" },
  ]},
  { code: "972", name: "Martinique", region: "Martinique", slug: "martinique", cities: [
    { name: "Fort-de-France", slug: "fort-de-france" },
    { name: "Le Lamentin", slug: "le-lamentin" },
    { name: "Schoelcher", slug: "schoelcher" },
  ]},
  { code: "973", name: "Guyane", region: "Guyane", slug: "guyane", cities: [
    { name: "Cayenne", slug: "cayenne" },
    { name: "Saint-Laurent-du-Maroni", slug: "saint-laurent-du-maroni" },
    { name: "Kourou", slug: "kourou" },
  ]},
  { code: "974", name: "La Réunion", region: "La Réunion", slug: "la-reunion", cities: [
    { name: "Saint-Denis", slug: "saint-denis-reunion" },
    { name: "Saint-Paul", slug: "saint-paul" },
    { name: "Saint-Pierre", slug: "saint-pierre" },
    { name: "Le Tampon", slug: "le-tampon" },
  ]},
  { code: "976", name: "Mayotte", region: "Mayotte", slug: "mayotte", cities: [
    { name: "Mamoudzou", slug: "mamoudzou" },
    { name: "Koungou", slug: "koungou" },
    { name: "Dzaoudzi", slug: "dzaoudzi" },
  ]},
];

export function getDepartmentBySlug(slug: string): Department | undefined {
  return frenchDepartments.find(d => d.slug === slug);
}

export function getCityBySlug(departmentSlug: string, citySlug: string): { department: Department; city: City } | undefined {
  const department = getDepartmentBySlug(departmentSlug);
  if (!department) return undefined;
  const city = department.cities.find(c => c.slug === citySlug);
  if (!city) return undefined;
  return { department, city };
}

export function getAllCities(): { city: City; department: Department }[] {
  const allCities: { city: City; department: Department }[] = [];
  for (const dept of frenchDepartments) {
    for (const city of dept.cities) {
      allCities.push({ city, department: dept });
    }
  }
  return allCities;
}

export function getRegions(): string[] {
  const regions = new Set<string>();
  for (const dept of frenchDepartments) {
    regions.add(dept.region);
  }
  return Array.from(regions).sort();
}

export function getDepartmentsByRegion(region: string): Department[] {
  return frenchDepartments.filter(d => d.region === region);
}
