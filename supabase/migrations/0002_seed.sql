-- SheLeads Studios seed data

-- ============================================================================
-- 10 psychographic statements
-- ============================================================================
insert into public.seed_statements (id, text, tag) values
  (1,  'Mental health is as important as winning.',                  'mental_health'),
  (2,  'Brands I work with must match my values, even if it costs me money.', 'values_first'),
  (3,  'I want to be a role model for younger athletes.',            'role_model'),
  (4,  'Sustainability matters to me in the brands I wear.',         'sustainability'),
  (5,  'I enjoy creating content about my sport.',                   'content_creator'),
  (6,  'I want to compete at the highest international level one day.', 'elite_ambition'),
  (7,  'Equal pay and visibility for female athletes is a cause I stand for.', 'equality'),
  (8,  'I see my body as a tool, not a product.',                    'body_autonomy'),
  (9,  'Community support matters more than individual glory.',      'community'),
  (10, 'I am comfortable being vocal about social issues.',          'activism')
on conflict (id) do update set text = excluded.text, tag = excluded.tag;

-- ============================================================================
-- 16 athletes (varied sports, varied fame, women, inclusive)
-- Photo URLs are Unsplash source URLs — deterministic & royalty-free at demo-time.
-- ============================================================================
insert into public.seed_athletes (id, name, sport, tagline, photo_url, tags) values
  (1,  'Nafi Thiam',         'Heptathlon',       'Belgian Olympic icon & role model',        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=640&q=70', array['role_model','elite_ambition','equality']),
  (2,  'Lotte Kopecky',      'Road cycling',     'World champion, quiet confidence',         'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=640&q=70', array['elite_ambition','community']),
  (3,  'Kimia Yousofi',      'Sprint',           'Afghan refugee sprinter, defiant hope',    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=640&q=70', array['activism','equality','role_model']),
  (4,  'Zaya Jones',         'Roller derby',     'Captain, community builder',               'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=640&q=70', array['community','activism']),
  (5,  'Amel Majri',         'Football',         'French midfielder, maternity trailblazer', 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=640&q=70', array['equality','role_model']),
  (6,  'Sara Takanashi',     'Ski jumping',      'Olympic medallist, cult niche star',       'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=640&q=70', array['elite_ambition']),
  (7,  'Tatyana McFadden',   'Para-athletics',   '17x Paralympic medals',                    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=640&q=70', array['role_model','equality','activism']),
  (8,  'Oona Laurence',      'Climbing',         'Bouldering, Belgian circuit',              'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=640&q=70', array['sustainability','community']),
  (9,  'Nina Derwael',       'Gymnastics',       'Belgian Olympic gold, uneven bars',        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=70', array['mental_health','elite_ambition']),
  (10, 'Elissa Brunato',     'Surfing',          'Eco-activist & content creator',           'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=640&q=70', array['sustainability','content_creator']),
  (11, 'Jess Thom',          'Wheelchair fencing','Paralympian & Tourette''s advocate',      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=70', array['activism','mental_health','body_autonomy']),
  (12, 'Alanna Flax',        'Cricket',          'Belgian national cricket team',            'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=640&q=70', array['community','role_model']),
  (13, 'Maïlys Van Duyse',   'Triathlon',        'Belgian age-group winner',                 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=640&q=70', array['elite_ambition','mental_health']),
  (14, 'Imane Salem',        'Boxing',           'Amateur welterweight, Brussels gym',       'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=640&q=70', array['activism','equality']),
  (15, 'Chloé Deceuninck',   'Skateboarding',    'Flanders skate scene, queer voice',        'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=640&q=70', array['community','activism','content_creator']),
  (16, 'Fatou Mendy',        'Hockey',           'Red Panthers midfielder',                  'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=640&q=70', array['community','role_model'])
on conflict (id) do update set
  name = excluded.name, sport = excluded.sport, tagline = excluded.tagline,
  photo_url = excluded.photo_url, tags = excluded.tags;

-- ============================================================================
-- 16 local/smaller Belgian brands
-- ============================================================================
insert into public.seed_brands
  (id, name, category, photo_url, tagline, values_tags, audience_fit, sport_affinity, size, city)
values
  (1,  'Komrads',           'Footwear',         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&q=70', 'Vegan, recycled sneakers from Antwerp',               array['sustainability','activism','equality'], array['women_20_35','belgium_first'], array['street','urban','casual'],         'small','Antwerp'),
  (2,  'Hope',               'Activewear',       'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=640&q=70', 'Ghent-made performance basics',                        array['community','body_autonomy','sustainability'], array['women_18_40','belgium_first'], array['running','yoga','multi_sport'],  'micro','Ghent'),
  (3,  'Kalm',               'Wellness',         'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=640&q=70', 'Magnesium & recovery supplements',                     array['mental_health','body_autonomy'], array['women_20_45'], array['endurance','yoga','multi_sport'],              'micro','Brussels'),
  (4,  'BelgicaBeat',        'Media / podcast',  'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=640&q=70', 'Storytelling for Belgian athletes',                    array['community','role_model','content_creator'], array['women_18_35'], array['multi_sport'],                        'micro','Brussels'),
  (5,  'Rewild',             'Outdoor gear',     'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=70', 'Trail + climbing micro-brand',                         array['sustainability','community'], array['women_20_40','belgium_first'], array['climbing','trail','cycling'],        'small','Liège'),
  (6,  'Joolz Athletics',    'Fashion',          'https://images.unsplash.com/photo-1485518882345-15568b007407?w=640&q=70', 'Streetwear-meets-performance',                         array['activism','equality','content_creator'], array['women_18_28'], array['street','skate','urban'],                'small','Antwerp'),
  (7,  'Sofie Bio',          'Skincare',         'https://images.unsplash.com/photo-1522335789203-aaa1c4b1a86b?w=640&q=70', 'Clean skincare for sweaty skin',                       array['body_autonomy','sustainability'], array['women_20_40'], array['multi_sport'],                            'micro','Bruges'),
  (8,  'KOERS Coffee',       'Food / drink',     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=70', 'Specialty coffee for ride days',                       array['community','content_creator'], array['women_20_45','belgium_first'], array['cycling','running','multi_sport'], 'small','Leuven'),
  (9,  'Flanders Field Bars','Nutrition',        'https://images.unsplash.com/photo-1505575967455-40e256f73376?w=640&q=70', 'Local-grain energy bars',                              array['sustainability','community'], array['women_20_45','belgium_first'], array['endurance','cycling','running'], 'micro','Kortrijk'),
  (10, 'Studio Spica',       'Studio / coaching','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=70', 'Strength coaching for women',                          array['body_autonomy','community','equality'], array['women_25_45'], array['strength','multi_sport'],      'micro','Brussels'),
  (11, 'Parlor',             'Eyewear',          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=640&q=70', 'Belgian-designed sport glasses',                       array['content_creator','community'], array['women_20_35'], array['cycling','running','multi_sport'],       'small','Antwerp'),
  (12, 'Crible',              'Media',            'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=640&q=70', 'French-speaking sport mag for women',                  array['equality','role_model','activism'], array['women_18_40','belgium_first'], array['multi_sport'],                'micro','Liège'),
  (13, 'Brussels Boxing Academy','Gym',          'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=640&q=70', 'Inclusive boxing club',                                 array['community','activism','equality'], array['women_18_35','belgium_first'], array['boxing','combat','strength'],  'small','Brussels'),
  (14, 'Plant & Power',      'Nutrition',        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=70', 'Plant-based protein for athletes',                     array['sustainability','body_autonomy'], array['women_20_40'], array['multi_sport','strength'],             'small','Ghent'),
  (15, 'MOVE Magazine',      'Media',            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=70', 'Independent women-in-sport print',                     array['equality','role_model','content_creator'], array['women_18_40'], array['multi_sport'],                    'micro','Brussels'),
  (16, 'Onder Ons',          'Apparel',          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&q=70', 'Oversized tees by Belgian artists',                    array['community','activism'], array['women_18_30'], array['street','skate','urban'],                         'micro','Antwerp')
on conflict (id) do update set
  name = excluded.name, category = excluded.category, photo_url = excluded.photo_url,
  tagline = excluded.tagline, values_tags = excluded.values_tags,
  audience_fit = excluded.audience_fit, sport_affinity = excluded.sport_affinity,
  size = excluded.size, city = excluded.city;
