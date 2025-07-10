-- TooHot Online Ordering System - Menu Items Data
-- INSERT statements for all menu items from menu.json

-- Clear existing menu items (optional - uncomment if needed)
-- DELETE FROM public.menu_items;

-- Insert all menu items
INSERT INTO public.menu_items (
    name_en, name_zh, description_en, description_zh, price_cents, category, 
    is_available, is_popular, is_vegetarian, is_vegan, spice_level, allergens
) VALUES 
-- Appetite Awakeners
('Marinated Cold Tofu Bites', '冷味豆干', 'Tender marinated tofu bites with aromatic spices and seasonings.', '腌制豆干配芳香香料和调味料。', 1599, 'appetite-awakener', true, false, false, false, 2, ARRAY['soy']),
('Golden Braised Pork Roll', '卤水厚切肉卷', 'Thick-cut pork roll braised in golden soy sauce with five-spice.', '厚切猪肉卷配金色卤水和五香调料。', 1399, 'appetite-awakener', true, false, false, false, null, ARRAY['soy']),
('Squid with Wasabi and Sea Salt', '芥末味海盐鱿鱼', 'Fresh squid with zesty wasabi and sea salt seasoning.', '新鲜鱿鱼配芥末和海盐调味。', 1599, 'appetite-awakener', true, false, false, false, null, ARRAY['seafood']),
('Sweet and Sour Nut Short Ribs', '糖醋坚果小排', 'Tender short ribs in a sweet and sour glaze with crunchy nuts.', '嫩小排配糖醋汁和酥脆坚果。', 1599, 'appetite-awakener', true, false, false, false, null, ARRAY['nuts', 'soy']),
('Eggplant Strips with Roasted Pepper', '烧椒茄条', 'Tender eggplant strips with charred peppers and aromatic seasonings.', '嫩茄条配烧椒和芳香调料。', 1699, 'appetite-awakener', true, false, true, false, 1, ARRAY['soy']),
('Smoked Crispy Duck', '烟熏脆皮鸭', 'House-smoked duck with crispy skin and tender meat.', '自制烟熏鸭配酥脆鸭皮和嫩肉。', 2599, 'appetite-awakener', true, false, false, false, null, ARRAY[]::text[]),
('Thai Sour Chicken', '泰味酸酸鸡', 'Thai-inspired sour chicken with lime and herbs.', '泰式酸鸡配青柠和香草。', 1399, 'appetite-awakener', true, false, false, false, 1, ARRAY[]::text[]),
('Hot and Sour Edamame with Butter', '黄油酸辣枝豆', 'Fresh edamame in a spicy butter sauce with tangy seasonings.', '新鲜毛豆配辣黄油酱和酸味调料。', 999, 'appetite-awakener', true, false, true, false, null, ARRAY['dairy', 'soy']),
('Vegetarian Cold Noodle', '素凉面', 'Refreshing cold noodles with vegetarian toppings and a spicy sauce.', '清爽凉面配素食配菜和辣酱。', 999, 'appetite-awakener', true, false, true, false, 3, ARRAY['gluten', 'soy']),
('Chengdu Mala Cold Chicken', '棒棒鸡', 'Classic Chengdu-style cold chicken with numbing and spicy flavors.', '经典成都麻辣冷鸡丝。', 1299, 'appetite-awakener', true, true, false, false, 2, ARRAY['soy']),

-- Protein - Chicken
('Kung Pao Chicken', '宫保鸡丁', 'A classic Sichuan stir-fry with diced chicken, peanuts, and chili peppers.', '一道经典的川菜，包括鸡丁、花生和辣椒。', 1899, 'protein-chicken', true, false, false, false, 1, ARRAY['peanuts']),
('Stir-Fried Chicken with Peppers', '槽辣椒生炒鸡', 'Tender chicken stir-fried with fresh chili peppers for a crisp, spicy flavor.', '鲜嫩鸡肉与生辣椒猛火快炒，口感爽脆，辣味十足。', 1899, 'protein-chicken', true, false, false, false, 3, ARRAY[]::text[]),
('Xifeng Spicy Chicken', '息峰辣子鸡', 'A specialty from Xifeng, this dish features crispy chicken smothered in a fragrant, spicy chili mix.', '息烽特色菜，香脆鸡肉裹上香辣的辣椒混合物。', 2899, 'protein-chicken', true, false, false, false, 3, ARRAY['gluten']),
('Yunnan Flavor Spicy Chicken', '滇味辣子鸡', 'A unique take on spicy chicken with the distinctive flavors and herbs of Yunnan province.', '风味独特的辣子鸡，融合了云南省特有的香料和草药。', 2899, 'protein-chicken', true, false, false, false, null, ARRAY['gluten']),
('Gold Griddle Spicy Chicken', '金牌干锅香辣鸡', 'Chicken cooked in a dry pot with a variety of spices, creating an intensely aromatic and spicy dish.', '鸡肉在干锅中与多种香料一同烹制，香气浓郁，辣味十足。', 2099, 'protein-chicken', true, true, false, false, 2, ARRAY[]::text[]),
('Stir-Fried Chicken With Lemongrass', '香茅小炒鸡', 'Aromatic stir-fried chicken with the bright, citrusy flavor of lemongrass.', '香茅的清新柑橘味与鸡肉的完美结合。', 2099, 'protein-chicken', true, false, false, false, 2, ARRAY[]::text[]),
('Sweet & Sour Eight-Piece Chicken', '鱼香八块鸡', 'Classic sweet and sour flavors with eight pieces of tender chicken.', '经典的甜酸口味，配上八块鲜嫩的鸡肉。', 1899, 'protein-chicken', true, false, false, false, null, ARRAY['gluten']),
('Red & Green Pepper Chicken', '双椒干煸鸡', 'Dry-fried chicken with a vibrant mix of red and green peppers for a colorful and spicy dish.', '干煸鸡肉配上鲜艳的红绿辣椒，色彩鲜明，味道香辣。', 2899, 'protein-chicken', true, false, false, false, 3, ARRAY[]::text[]),
('Fermented Greens Chicken with Crepes', '鸡米芽菜配薄饼', 'Minced chicken stir-fried with fermented greens, served with thin crepes for wrapping.', '鸡肉末与发酵的芽菜一同炒制，配以薄饼包裹食用。', 1899, 'protein-chicken', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Roasted Chicken with Sesame and Pepper', '油麻烧椒仔鸡', 'Roasted chicken with a rich sesame and pepper glaze.', '烤鸡配以浓郁的芝麻和胡椒酱汁。', 1899, 'protein-chicken', true, false, false, false, null, ARRAY['sesame']),
('Truffle-Glazed Roast Chicken', '黑松露煎焗鸡', 'Luxurious roast chicken glazed with black truffle for an earthy, aromatic flavor.', '奢华的烤鸡，涂有黑松露，带来泥土般的芳香。', 2299, 'protein-chicken', true, false, false, false, null, ARRAY[]::text[]),
('Stir-fri Chicken with Clam', '花甲鸡', 'A surf-and-turf delight, this dish combines tender chicken with fresh clams in a savory sauce.', '一道海陆大餐，将鲜嫩的鸡肉与新鲜的蛤蜊在美味的酱汁中结合。', 2999, 'protein-chicken', true, false, false, false, 3, ARRAY['seafood']),
('Garlic Chicken with Fermented Black Beans', '豆豉蒜蓉鸡', 'A flavor-packed dish of chicken cooked with pungent fermented black beans and garlic.', '一道风味浓郁的菜肴，鸡肉与香浓的发酵黑豆和蒜蓉一同烹制。', 2999, 'protein-chicken', true, false, false, false, null, ARRAY['soy']),

-- Protein - Beef
('Spicy Stir-Fried Beef', '辣炒胸口牛', 'Tender beef slices stir-fried with a generous amount of spicy peppers.', '鲜嫩的牛肉片与大量辛辣的辣椒一同炒制。', 2299, 'protein-beef', true, false, false, false, 2, ARRAY[]::text[]),
('Fresh Ginger Beef Stir-Fry', '小炒仔姜牛肉丝', 'Julienned beef stir-fried with fresh, zesty ginger for a vibrant and aromatic dish.', '牛肉丝与鲜嫩的姜丝一同炒制，味道鲜美，香气扑鼻。', 2299, 'protein-beef', true, false, false, false, 1, ARRAY[]::text[]),
('Sizzling Cumin Beef', '铁板孜然牛肉', 'Beef seasoned with cumin and other spices, served on a sizzling hot plate.', '用孜然等香料调味的牛肉，放在滚烫的铁板上。', 2299, 'protein-beef', true, true, false, false, null, ARRAY[]::text[]),
('Beef Cubes with Black Pepper and Butter', '黑椒黄油肉眼牛肉粒', 'Tender beef cubes cooked with a rich black pepper and butter sauce.', '鲜嫩的牛肉粒配以浓郁的黑胡椒和黄油酱汁。', 3699, 'protein-beef', true, false, false, false, null, ARRAY['dairy']),
('Cumin Griddle Wolf Tooth Potato Beef', '孜然干锅狼牙土豆牛肉', 'A flavorful dry pot dish with beef and crinkle-cut "wolf tooth" potatoes, seasoned with cumin.', '一道风味十足的干锅菜，包含牛肉和波浪形的"狼牙"土豆，用孜然调味。', 2899, 'protein-beef', true, false, false, false, 1, ARRAY[]::text[]),
('Spicy Tricolor Minced Beef', '牛肉红三剁', 'A classic Yunnan dish with minced beef, tomatoes, and peppers, creating a colorful and spicy mix.', '一道经典的云南菜，由牛肉末、西红柿和辣椒组成，色彩鲜艳，味道香辣。', 2099, 'protein-beef', true, false, false, false, 1, ARRAY[]::text[]),
('Tangy & Spicy Fermented Veges Beef', '糟辣椒泡菜炒牛肉', 'Stir-fried beef with the unique tang and spice of fermented vegetables and chili.', '炒牛肉配以独特的酸辣发酵蔬菜和辣椒。', 2299, 'protein-beef', true, false, false, false, null, ARRAY[]::text[]),
('Braised Beef in Zesty Guizhou Sour Broth', '贵州酸汤烩牛柳', 'Tender beef braised in the iconic sour and zesty broth from Guizhou province.', '鲜嫩的牛肉在贵州省标志性的酸汤中炖煮。', 2299, 'protein-beef', true, true, false, false, null, ARRAY[]::text[]),
('Fiery Charred Chili & Silken Tofu Beef', '烧辣椒豆花牛柳', 'A fiery dish of beef and silken tofu, topped with charred chili for a smoky flavor.', '一道火辣的牛肉和豆花菜肴，上面铺有烧焦的辣椒，增添了烟熏的风味。', 2299, 'protein-beef', true, false, false, false, 1, ARRAY['soy']),
('Beef & Mushrooms on a Sizzling Hot Plate', '铁板野菌炒牛肉', 'Stir-fried beef and wild mushrooms served on a sizzling hot plate to enhance the aroma and flavor.', '炒牛肉和野菌放在滚烫的铁板上，增强了香气和风味。', 2299, 'protein-beef', true, false, false, false, null, ARRAY[]::text[]),
('Tibetan Style Sizzling Beef', '藏式铁锅牛肉', 'A hearty and flavorful dish of beef cooked in a Tibetan-style iron pot, served with crepes.', '一道丰盛美味的藏式铁锅牛肉，配以薄饼。', 3099, 'protein-beef', true, false, false, false, 3, ARRAY['gluten']),

-- Protein - Pork
('Huo Shao Yun Black Three-Stage Minced Pork', '火烧云黑三剁', 'A fiery and flavorful dish of minced pork cooked in three stages with a special black bean sauce.', '一道火爆美味的肉末菜肴，分三阶段用特制黑豆酱烹制而成。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['soy']),
('Twice-cooked Pork', '回锅肉', 'A Sichuan classic, this dish features pork belly that is first boiled, then stir-fried with vegetables and a spicy bean paste.', '一道四川经典菜，五花肉先煮后与蔬菜和辣豆酱一起炒。', 2099, 'protein-pork', true, true, false, false, null, ARRAY['soy']),
('Stir-fried Braised Pork with Small Chilies', '小米辣煸卤肉', 'Tender braised pork stir-fried with small, potent chilies for a spicy kick.', '鲜嫩的卤肉与小而烈的小米椒一同炒制，辣味十足。', 2099, 'protein-pork', true, false, false, false, null, ARRAY[]::text[]),
('Yunnan Ham with Mixed Mushrooms', '云腿杂菌', 'A savory dish featuring the famous Yunnan ham stir-fried with a variety of wild mushrooms.', '一道美味的菜肴，以著名的云南火腿和多种野生菌一同炒制。', 2099, 'protein-pork', true, false, false, false, null, ARRAY[]::text[]),
('Vinegar-flavored Tender Pork', '醋香小酥肉', 'Crispy, tender pork with a tangy vinegar flavor.', '香脆鲜嫩的猪肉，带有浓郁的醋味。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['gluten']),
('Braised Pork Meatballs with Soybeans', '豆米煮肉丸', 'Hearty pork meatballs braised with soybeans in a savory broth.', '丰盛的猪肉丸子与大豆在美味的肉汤中炖煮。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['soy']),
('Stir-fried Pork with Thai Basil and Flatbread', '打抛猪配饼', 'A Thai-inspired dish of stir-fried pork with fragrant basil, served with flatbread.', '一道泰式风味的菜肴，炒猪肉配以芬芳的罗勒，佐以薄饼。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['gluten']),
('Stir-fried Pork Belly with Fermented Black Soybeans', '水豆豉炒五花', 'Savory pork belly stir-fried with the intense, salty flavor of fermented black soybeans.', '美味的五花肉与味道浓郁的发酵黑豆一同炒制。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['soy']),
('Braised Pork Ball in Sweet & Sour Chili Sauce', '鱼香狮子头', 'Large, tender pork meatballs, known as "lion''s heads," braised in a classic sweet and sour chili sauce.', '大而嫩的猪肉丸子，被称为"狮子头"，在经典的鱼香酱汁中炖煮。', 2099, 'protein-pork', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Crispy Pork in Chickpea and Pea Leaf Soup', '酥肉豆汤豆苗', 'A comforting soup with crispy pork, chickpeas, and tender pea leaves.', '一道舒适的汤，配有酥脆的猪肉、鹰嘴豆和鲜嫩的豆苗。', 2099, 'protein-pork', true, false, false, false, null, ARRAY[]::text[]),

-- Protein - Seafood
('Crispy Anhui Fish in Fermented Cabbage Soup', '苗家酸汤脆皖鱼', 'Crispy Anhui fish served in a tangy and savory soup made with fermented cabbage, a specialty of the Miao people.', '脆皮皖鱼配以苗族特色的酸菜汤，酸爽开胃。', 3999, 'protein-seafood', true, false, false, false, null, ARRAY['fish']),
('Sea Bass Dressed with Crafted Chili Sauce', '老干妈拌海鲈', 'Tender sea bass dressed in a sauce made from the famous Lao Gan Ma chili crisp.', '鲜嫩的海鲈鱼，佐以著名的老干妈辣椒酱。', 4999, 'protein-seafood', true, true, false, false, null, ARRAY['fish', 'soy']),
('Kung Pao Black Tiger Shrimp', '宫保虾球', 'A classic Kung Pao dish with large, succulent black tiger shrimp.', '一道经典的宫保菜，配以大而多汁的黑虎虾。', 3099, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp', 'peanuts']),
('Shrimp Paste with Tomatoes', '虾滑烧番茄', 'A savory dish of shrimp paste cooked with fresh tomatoes.', '一道美味的虾滑菜肴，与新鲜的西红柿一同烹制。', 2299, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp']),
('Fried Squid with Tangy Fermented Chilies', '糟辣椒炒鱿鱼', 'Tender squid stir-fried with the unique tang and spice of fermented chili.', '鲜嫩的鱿鱼与独特的酸辣发酵辣椒一同炒制。', 2299, 'protein-seafood', true, false, false, false, 2, ARRAY['seafood']),
('Shrimp with Salted Egg Yolk', '咸蛋黄虾仁', 'A popular dish of shrimp coated in a rich and savory salted egg yolk sauce.', '一道受欢迎的菜肴，虾仁裹着浓郁咸香的咸蛋黄酱。', 2899, 'protein-seafood', true, true, false, false, null, ARRAY['shrimp', 'egg']),
('Dafang Sizzling Dry Pot Shrimp', '大方辣椒干锅虾', 'A dry pot dish with shrimp and a special chili mix from Dafang county.', '一道干锅菜，配以虾和来自大方县的特制辣椒混合物。', 2899, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp']),
('Teppan-Grilled Jumbo Shrimp with Black Pepper', '铁板黑椒啫大虾', 'Large jumbo shrimp grilled on a teppan with a savory black pepper sauce.', '在铁板上烤制的大虾，配以美味的黑胡椒酱。', 3299, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp']),
('Secret Sizzling Squid Tentacles', '秘制铁板鱿鱼须', 'Squid tentacles grilled on a sizzling plate with a secret, flavorful sauce.', '在滚烫的铁板上烤制的鱿鱼须，配以秘制的美味酱汁。', 2899, 'protein-seafood', true, false, false, false, null, ARRAY['seafood']),
('Organic Mushroom Egg Shrimp Balls with Black Truffle', '野菌松露滑蛋虾球', 'A luxurious dish of shrimp balls and scrambled eggs, flavored with organic mushrooms and black truffle.', '一道奢华的菜肴，虾球和炒蛋，配以有机蘑菇和黑松露。', 3699, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp', 'egg']),
('Homemade Kimchi with Snakehead Fish', '自制泡菜乌鱼花', 'Snakehead fish cooked with homemade kimchi for a tangy and spicy flavor.', '乌鱼花与自制泡菜一同烹制，味道酸辣。', 3699, 'protein-seafood', true, false, false, false, 2, ARRAY['fish']),
('Shrimp Ball with Crispy Rice', '锅巴虾球', 'A delightful dish of shrimp balls served with crispy rice.', '一道美味的虾球菜肴，佐以香脆的锅巴。', 2999, 'protein-seafood', true, false, false, false, null, ARRAY['shrimp', 'gluten']),
('Grilled Whole Sea Bass with Spicy Ginger and Tofu', '仔姜米辣豆花烤海鲈鱼', 'A whole sea bass grilled with spicy ginger and silken tofu.', '整条海鲈鱼配以辛辣的姜和嫩滑的豆花烤制而成。', 5299, 'protein-seafood', true, false, false, false, 3, ARRAY['fish', 'soy']),
('Grilled Whole Sea Bass with Spicy Tofu', '香辣豆花烤海鲈鱼', 'A whole sea bass grilled with spicy tofu for a fiery kick.', '整条海鲈鱼配以辛辣的豆花烤制而成，味道火爆。', 5299, 'protein-seafood', true, false, false, false, 2, ARRAY['fish', 'soy']),
('Grilled Whole Sea Bass with Garlic Bean Paste and Tofu', '豉汁蒜香豆花烤海鲈鱼', 'A whole sea bass grilled with a savory garlic bean paste and silken tofu.', '整条海鲈鱼配以美味的蒜蓉豆豉酱和嫩滑的豆花烤制而成。', 5299, 'protein-seafood', true, false, false, false, null, ARRAY['fish', 'soy']),

-- Carbs
('White Rice - Small', '小白饭', 'A small bowl of steamed white rice.', '一小碗白米饭。', 300, 'carbs', true, false, true, true, null, ARRAY[]::text[]),
('White Rice - Large', '大白米饭', 'A large bowl of steamed white rice.', '一大碗白米饭。', 1200, 'carbs', true, false, true, true, null, ARRAY[]::text[]),
('Plain Noodles', '面条', 'A simple dish of plain noodles.', '一碗简单的素面。', 500, 'carbs', true, false, true, true, null, ARRAY['gluten']),

-- Cold Beverages
('Diet Coke', '健怡可乐', 'Classic sugar-free cola with a crisp, refreshing taste.', '经典无糖可乐，口感清脆爽口。', 300, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),
('Sprite', '雪碧', 'Clear, crisp lemon-lime soda with natural citrus flavors.', '清澈爽脆的柠檬青柠汽水，天然柑橘风味。', 300, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),
('Arctic Ocean (Tangerine Flavored Soda)', '北冰洋', 'Classic Beijing orange soda with an authentic tangerine flavor.', '经典北京橙味汽水，正宗桔子风味。', 400, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),
('Herbal Tea', '王老吉', 'Traditional Chinese herbal tea drink for cooling and wellness.', '传统中式凉茶饮品，清热降火。', 400, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),
('Coconut Milk Drink', '椰奶', 'Creamy coconut milk beverage with a natural tropical flavor.', '奶香椰奶饮品，天然热带风味。', 400, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),
('Soybean Milk Drink', '豆奶', 'Smooth and nutritious soybean milk drink, naturally plant-based.', '顺滑营养的豆奶饮品，天然植物性。', 400, 'cold-beverages', true, false, true, false, null, ARRAY['soy']),
('Coke', '可乐', 'Classic Coca-Cola with its signature refreshing taste.', '经典可口可乐，标志性清爽口感。', 300, 'cold-beverages', true, true, true, false, null, ARRAY[]::text[]),
('Saratoga Sparkling', '气泡水', 'Premium sparkling water with natural effervescence.', '优质气泡水，天然碳酸气泡。', 500, 'cold-beverages', true, false, true, false, null, ARRAY[]::text[]),

-- Greens/Vegetarian
('Fragrant Tea Flavored Cowpea', '酵香茶味长豇豆', 'Fresh cowpeas infused with aromatic tea flavors and fermented seasonings.', '新鲜豇豆配芳香茶味和发酵调料。', 1699, 'greens-vegetarian', true, false, true, false, null, ARRAY['soy']),
('Mapo Stone Pot Tofu', '麻婆石锅豆腐', 'Classic Sichuan mapo tofu served sizzling in a stone pot with numbing spices.', '经典川菜麻婆豆腐在石锅中滋滋作响，配麻辣调料。', 1699, 'greens-vegetarian', true, false, true, false, 3, ARRAY['soy']),
('Puning Tofu with Bean Sauce', '普宁豆酱豆腐', 'Traditional Puning-style tofu braised in a rich, savory bean sauce.', '传统普宁风味豆腐配浓郁美味豆酱。', 1699, 'greens-vegetarian', true, false, true, false, null, ARRAY['soy']),
('Dry Pot Oil, Scallion Crispy Brussels Sprouts', '干锅油葱酥孢子甘蓝', 'Brussels sprouts wok-fried in a dry pot style with crispy scallion oil.', '球芽甘蓝干锅炒制配酥脆葱油。', 1899, 'greens-vegetarian', true, false, true, false, 2, ARRAY[]::text[]),
('Fried Mushrooms with Black Pepper Butter', '黑椒黄油炒杂菌', 'Mixed wild mushrooms sautéed with aromatic black pepper and rich butter.', '野生杂菌配香黑胡椒和浓郁黄油炒制。', 2099, 'greens-vegetarian', true, false, true, false, null, ARRAY['dairy']),
('Kung Pao Cooked into Tofu', '宫保熟成豆腐', 'Aged tofu prepared Kung Pao style with peanuts and dried chilies.', '熟成豆腐配花生和干辣椒的宫保做法。', 2299, 'greens-vegetarian', true, false, true, false, 3, ARRAY['soy', 'peanuts']),
('Yu-Shiang Eggplant (Sautéed with Spicy Garlic Sauce)', '鱼香茄子', 'Classic Sichuan eggplant in a sweet and spicy garlic sauce with a fish fragrance.', '经典川菜茄子配甜辣蒜蓉鱼香汁。', 1699, 'greens-vegetarian', true, true, true, false, 3, ARRAY['soy']),
('Yunnan Ham Stewed Chayote', '云南火腿烩节瓜', 'Fresh chayote braised with aromatic Yunnan ham in a savory broth.', '新鲜节瓜配芳香云南火腿在美味汤汁中炖煮。', 2299, 'greens-vegetarian', true, false, false, false, null, ARRAY[]::text[]),
('Small Potatoes with Cumin Dry Pot', '孜然干锅小土豆', 'Baby potatoes cooked dry pot style with aromatic cumin and spices.', '小土豆干锅烹饪配芳香孜然和香料。', 1699, 'greens-vegetarian', true, true, true, false, 2, ARRAY[]::text[]),
('Old Milk Potato', '老奶洋芋', 'Traditional Yunnan-style mashed potatoes with a creamy, comforting texture.', '传统云南风味土豆泥，质地顺滑舒适。', 1899, 'greens-vegetarian', true, false, true, false, null, ARRAY['dairy']),
('Teppanyaki Fish Flavored Pulp Tofu', '铁板鱼香包浆豆腐', 'Silky tofu with a creamy center served on a hot plate with a fish fragrance sauce.', '滑嫩豆腐配奶油中心在热铁板上配鱼香汁。', 1899, 'greens-vegetarian', true, false, true, false, 2, ARRAY['soy']),
('Baby Bok Choy with Supreme Broth', '上汤娃娃菜', 'Tender baby bok choy in a rich, flavorful supreme vegetable broth.', '嫩娃娃菜配浓郁美味上汤。', 2099, 'greens-vegetarian', true, false, true, false, null, ARRAY[]::text[]),
('Spicy Cowpea Stewed Eggplant Strips', '米辣豇豆烩茄条', 'Eggplant strips braised with spicy cowpeas in an aromatic sauce.', '茄条配麻辣豇豆在香料汁中炖煮。', 1899, 'greens-vegetarian', true, false, true, false, 3, ARRAY['soy']),
('Baked Lotus Root Strips with Salted Egg Yolk', '咸蛋黄焗藕条', 'Crispy lotus root strips baked with a rich, creamy salted egg yolk.', '脆藕条配浓郁奶香咸蛋黄焗制。', 2299, 'greens-vegetarian', true, false, true, false, null, ARRAY['eggs']),
('Three Stages Chopped Mushrooms with Toast', '野菌红三剁配锅巴', 'Wild mushrooms prepared in three stages, served with crispy rice crust.', '野菌三阶段制作配酥脆锅巴。', 2299, 'greens-vegetarian', true, false, true, false, null, ARRAY['gluten']),
('Foil Baked Mushrooms with Garlic', '金蒜锡纸焗蘑菇', 'Fresh mushrooms baked in foil with golden garlic and aromatic herbs.', '新鲜蘑菇配金蒜和香草锡纸焗制。', 2299, 'greens-vegetarian', true, false, true, false, null, ARRAY[]::text[]),
('Pea Stewed Potatoes with Fennel', '豌豆茴香烩土豆', 'Tender potatoes and fresh peas braised with aromatic fennel.', '嫩土豆和新鲜豌豆配芳香茴香炖煮。', 1999, 'greens-vegetarian', true, false, true, false, null, ARRAY[]::text[]),
('Sautéed Cabbage in Casserole', '干锅手撕包菜', 'Hand-torn cabbage sautéed in a casserole with spicy seasonings.', '手撕包菜在砂锅中配辣味调料炒制。', 1699, 'greens-vegetarian', true, false, true, false, 3, ARRAY['soy']),
('Sautéed Organic Cauliflower in Casserole', '干锅有机花菜', 'Fresh organic cauliflower sautéed in a casserole with aromatic spices.', '新鲜有机花菜在砂锅中配芳香香料炒制。', 1699, 'greens-vegetarian', true, false, true, false, 3, ARRAY['soy']),

-- Entree Specials
('Chicken Giblets with Fermented Chili Relish', '老坛糟辣椒爆鸡杂', 'Tender chicken giblets stir-fried with traditional fermented chili relish.', '嫩滑鸡杂配老坛糟辣椒爆炒。', 2399, 'entree-specials', true, true, false, false, 3, ARRAY[]::text[]),
('Chili-Seared Native Chicken with Sichuan Aromatics', '尖椒小公鸡', 'Fresh native chicken seared with Sichuan chilies and aromatic spices.', '土鸡配尖椒和四川香料爆炒。', 2899, 'entree-specials', true, false, false, false, 3, ARRAY[]::text[]),
('Fiery Wok-Seared Pork Kidney with Sichuan Chilies', '霸道火爆腰花', 'Fresh pork kidney wok-seared with fiery Sichuan chilies.', '新鲜猪腰配川椒大火爆炒。', 2299, 'entree-specials', true, true, false, false, 3, ARRAY[]::text[]),
('"18-Spatula" Fiery Flash-Fried Liver', '18铲猛火肝片', 'Traditional 18-spatula technique for perfectly cooked liver with intense heat.', '传统18铲技法猛火爆炒肝片。', 2099, 'entree-specials', true, true, false, false, 3, ARRAY[]::text[]),
('Free-Range Chicken, Twin Chili Sauté', '思茅双椒小炒鸡', 'Free-range chicken stir-fried with two varieties of Sichuan chilies.', '散养鸡配双椒小炒。', 2399, 'entree-specials', true, true, false, false, 3, ARRAY[]::text[]),
('Braised Beltfish, Garlic-Chili Sauce', '鱼香带鱼烧宽粉', 'Tender braised beltfish in an aromatic garlic-chili sauce with wide noodles.', '鱼香汁红烧带鱼配宽粉。', 2699, 'entree-specials', true, false, false, false, 2, ARRAY['seafood', 'gluten']),
('Crispy Chicken Thigh, Chili Crisp', '歌乐山辣子鸡', 'Crispy chicken thigh pieces with Geleshan-style chili crisp.', '歌乐山风味辣子鸡。', 2599, 'entree-specials', true, false, false, false, 3, ARRAY[]::text[]),
('Slow-Braised Chicken Feet, Blistered Skin', '虎皮火锅凤爪', 'Tender braised chicken feet with a signature blistered skin texture.', '慢炖虎皮凤爪。', 2699, 'entree-specials', true, false, false, false, 3, ARRAY[]::text[]),
('Pork Meatballs, Sweet & Sour Garlic-Soy Glaze', '家烧鱼香肉丸子', 'House-made pork meatballs in a traditional sweet and sour garlic-soy glaze.', '家制猪肉丸配鱼香汁。', 2099, 'entree-specials', true, false, false, false, 2, ARRAY['soy']),
('Seared Duck Breast, Young Ginger Jus', '姜爆稻谷鸭', 'Premium duck breast seared with young ginger and aromatic seasonings.', '优质鸭胸配嫩姜爆炒。', 2899, 'entree-specials', true, false, false, false, 3, ARRAY[]::text[]),
('Spiced Beef & Offal Broth', '毛血旺', 'Traditional Sichuan spiced beef and offal in a rich, flavorful broth.', '传统川菜毛血旺。', 3099, 'entree-specials', true, true, false, false, 3, ARRAY['soy']),
('Baked Choy Sum, Ginkgo & Garlic Oil', '银杏焗菜苔', 'Fresh choy sum baked with ginkgo nuts and aromatic garlic oil.', '新鲜菜苔配银杏和蒜蓉油焗制。', 2099, 'entree-specials', true, false, true, false, 1, ARRAY['nuts']),

-- Tapas/Sides
('Braised Pork and Bamboo Shoots Bun', '酱肉笋干包', 'Steamed bun filled with savory braised pork and tender bamboo shoots.', '蒸包子包裹着美味的红烧肉和嫩竹笋。', 999, 'tapas-sides', true, false, false, false, null, ARRAY['gluten']),
('Fried Pork Dumplings (8 pcs)', '猪肉煎饺 (8个)', 'Pan-fried dumplings filled with seasoned pork, with a crispy bottom and tender top.', '煎饺配调味猪肉馅，底部酥脆，顶部软嫩。', 999, 'tapas-sides', true, true, false, false, null, ARRAY['gluten', 'soy']),
('Fried Chicken Dumplings (8 pcs)', '鸡肉煎饺 (8个)', 'Pan-fried dumplings with a savory chicken filling, golden and crispy.', '煎饺配美味鸡肉馅，金黄酥脆。', 999, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Fried Vegetable Dumplings (8 pcs)', '蔬菜煎饺 (8个)', 'Pan-fried dumplings filled with fresh seasonal vegetables.', '煎饺配新鲜时令蔬菜馅。', 999, 'tapas-sides', true, false, true, false, null, ARRAY['gluten', 'soy']),
('Handmade Teriyaki Chicken Spring Rolls', '手工照烧鸡春卷', 'Fresh spring rolls filled with teriyaki chicken and crisp vegetables.', '新鲜春卷配照烧鸡肉和爽脆蔬菜。', 799, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Black Pepper Beef Spring Rolls', '黑椒牛肉春卷', 'Crispy spring rolls with seasoned black pepper beef and fresh herbs.', '酥脆春卷配调味黑胡椒牛肉和新鲜香草。', 799, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Pork Spring Rolls with Bean Paste', '豆瓣酱猪肉春卷', 'Savory spring rolls with pork and traditional Sichuan bean paste.', '美味春卷配猪肉和传统四川豆瓣酱。', 799, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Fried Rice with Sprouts and Eggs', '芽菜鸡蛋炒饭', 'Wok-fried rice with fresh bean sprouts and fluffy scrambled eggs.', '锅炒米饭配新鲜豆芽和松软炒蛋。', 1699, 'tapas-sides', true, false, true, false, null, ARRAY['eggs', 'soy']),
('Yibin Fiery Noodles', '照通燃面', 'Signature dry noodles from Yibin with spicy oil and aromatic seasonings.', '宜宾招牌干面配辣油和香料调味。', 1699, 'tapas-sides', true, false, false, false, 3, ARRAY['gluten', 'soy']),
('Fried Rice with Black Pepper and Salmon', '黑椒三文鱼炒饭', 'Premium fried rice with fresh salmon and aromatic black pepper.', '优质炒饭配新鲜三文鱼和香黑胡椒。', 1899, 'tapas-sides', true, false, false, false, null, ARRAY['seafood', 'eggs', 'soy']),
('Braised Beef Noodle Soup', '红烧牛肉汤面', 'Hearty noodle soup with tender braised beef in a rich, savory broth.', '丰盛的面条汤配嫩红烧牛肉和浓郁美味汤底。', 1699, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Noodles with Pork Mushroom Sauce', '香菇酱肉拌面', 'Fresh noodles tossed in a savory pork and mushroom sauce.', '新鲜面条配美味猪肉香菇酱。', 1699, 'tapas-sides', true, false, false, false, null, ARRAY['gluten', 'soy']),
('Kung Pao Chicken Potstickers', '宫保鸡丁煎饺', 'Crispy potstickers filled with classic Kung Pao chicken and peanuts.', '酥脆锅贴配经典宫保鸡丁和花生。', 699, 'tapas-sides', true, false, false, false, 2, ARRAY['gluten', 'peanuts', 'soy']);

-- Add comment at the end about execution
-- Execute this script to populate the menu_items table with all items from menu.json
-- Remember to run this with appropriate permissions and after the table schema is created 