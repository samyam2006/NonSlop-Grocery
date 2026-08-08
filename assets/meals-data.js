/* =========================================================================
   MEALS — real-food meals for the plan generator.
   slot:  breakfast | lunch | dinner
   diet:  which diets this fits — omnivore | pescatarian | carnivore
   tier:  cheapest sourcing tier it belongs to — budget | standard | premium
          (budget selection = budget meals; standard = budget+standard;
           premium = everything)
   cost:  approx USD per serving at the STANDARD tier (scaled by tier at runtime)
   ing:   ingredients per serving — n name, q qty (number), u unit, cat section
          cat: meat | seafood | eggs | dairy | produce | fats | pantry
   ========================================================================= */
const MEALS = [
  /* ---------------- BREAKFASTS ---------------- */
  {id:"b1", slot:"breakfast", name:"Three-egg scramble in butter with avocado", diet:["omnivore","pescatarian","carnivore"], tier:"budget", cost:2.8,
   ing:[{n:"Eggs",q:3,u:"",cat:"eggs"},{n:"Butter",q:15,u:"g",cat:"fats"},{n:"Avocado",q:0.5,u:"",cat:"produce"}], note:"Cook low and slow; finish with flaky salt."},
  {id:"b2", slot:"breakfast", name:"Steak & eggs", diet:["omnivore","carnivore"], tier:"premium", cost:6.5,
   ing:[{n:"Sirloin or flat-iron steak",q:150,u:"g",cat:"meat"},{n:"Eggs",q:2,u:"",cat:"eggs"},{n:"Tallow or butter",q:15,u:"g",cat:"fats"}], note:"Rest the steak while the eggs fry in the drippings."},
  {id:"b3", slot:"breakfast", name:"Greek yogurt, berries, walnuts & honey", diet:["omnivore","pescatarian"], tier:"budget", cost:2.6,
   ing:[{n:"Full-fat Greek yogurt",q:200,u:"g",cat:"dairy"},{n:"Mixed berries (fresh/frozen)",q:80,u:"g",cat:"produce"},{n:"Walnuts",q:20,u:"g",cat:"pantry"},{n:"Raw honey",q:1,u:"tsp",cat:"pantry"}], note:"Plain, full-fat yogurt only — add your own honey."},
  {id:"b4", slot:"breakfast", name:"Smoked salmon & soft eggs", diet:["omnivore","pescatarian"], tier:"premium", cost:5.5,
   ing:[{n:"Smoked salmon",q:60,u:"g",cat:"seafood"},{n:"Eggs",q:2,u:"",cat:"eggs"},{n:"Butter",q:10,u:"g",cat:"fats"}], note:"Soft-scramble the eggs; fold the salmon in off the heat."},
  {id:"b5", slot:"breakfast", name:"Sardines on sourdough with butter", diet:["omnivore","pescatarian"], tier:"budget", cost:2.4,
   ing:[{n:"Tinned sardines",q:1,u:"tin",cat:"seafood"},{n:"Sourdough bread",q:2,u:"slices",cat:"pantry"},{n:"Butter",q:15,u:"g",cat:"fats"}], note:"The cheapest superfood breakfast there is."},
  {id:"b6", slot:"breakfast", name:"Cottage cheese, fruit & pumpkin seeds", diet:["omnivore","pescatarian"], tier:"budget", cost:2.2,
   ing:[{n:"Cottage cheese",q:200,u:"g",cat:"dairy"},{n:"Fruit (berries or pineapple)",q:100,u:"g",cat:"produce"},{n:"Pumpkin seeds",q:20,u:"g",cat:"pantry"}], note:"High protein, zinc from the seeds."},
  {id:"b7", slot:"breakfast", name:"Beef liver & onions, quick-seared", diet:["omnivore","carnivore"], tier:"budget", cost:2.3,
   ing:[{n:"Beef liver",q:100,u:"g",cat:"meat"},{n:"Onion",q:0.5,u:"",cat:"produce"},{n:"Butter",q:15,u:"g",cat:"fats"}], note:"Once a week. Sear 60–90s a side so it stays tender."},
  {id:"b8", slot:"breakfast", name:"Kefir & berry smoothie", diet:["omnivore","pescatarian"], tier:"budget", cost:2.0,
   ing:[{n:"Plain kefir",q:250,u:"ml",cat:"dairy"},{n:"Frozen berries",q:80,u:"g",cat:"produce"},{n:"Banana",q:0.5,u:"",cat:"produce"}], note:"Live cultures for the gut; skip the added sugar."},

  /* ---------------- LUNCHES ---------------- */
  {id:"l1", slot:"lunch", name:"Grilled chicken thighs over a big olive-oil salad", diet:["omnivore"], tier:"budget", cost:3.6,
   ing:[{n:"Chicken thighs (bone-in)",q:200,u:"g",cat:"meat"},{n:"Mixed salad greens",q:100,u:"g",cat:"produce"},{n:"Cucumber & tomato",q:150,u:"g",cat:"produce"},{n:"Extra-virgin olive oil",q:15,u:"ml",cat:"fats"}], note:"Thighs stay juicy and cost less than breast."},
  {id:"l2", slot:"lunch", name:"Beef & vegetable stir-fry in tallow", diet:["omnivore"], tier:"standard", cost:4.2,
   ing:[{n:"Beef strips (sirloin/rump)",q:150,u:"g",cat:"meat"},{n:"Mixed stir-fry veg",q:200,u:"g",cat:"produce"},{n:"Tallow or butter",q:15,u:"g",cat:"fats"},{n:"Garlic & ginger",q:1,u:"clove",cat:"produce"}], note:"High heat, fast; season with salt not bottled sauce."},
  {id:"l3", slot:"lunch", name:"Olive-oil tuna salad with egg", diet:["omnivore","pescatarian"], tier:"budget", cost:3.0,
   ing:[{n:"Tinned tuna in olive oil",q:1,u:"tin",cat:"seafood"},{n:"Egg (boiled)",q:1,u:"",cat:"eggs"},{n:"Salad greens",q:100,u:"g",cat:"produce"},{n:"Olive oil & lemon",q:10,u:"ml",cat:"fats"}], note:"Buy tuna packed in olive oil, not water."},
  {id:"l4", slot:"lunch", name:"Salmon fillet, rice & broccoli", diet:["omnivore","pescatarian"], tier:"premium", cost:6.0,
   ing:[{n:"Salmon fillet",q:150,u:"g",cat:"seafood"},{n:"White rice",q:75,u:"g",cat:"pantry"},{n:"Broccoli",q:150,u:"g",cat:"produce"},{n:"Butter",q:10,u:"g",cat:"fats"}], note:"Frozen wild salmon works and costs less."},
  {id:"l5", slot:"lunch", name:"Lamb kofta with cucumber-tomato & yogurt", diet:["omnivore"], tier:"standard", cost:4.8,
   ing:[{n:"Ground lamb",q:150,u:"g",cat:"meat"},{n:"Cucumber & tomato",q:150,u:"g",cat:"produce"},{n:"Full-fat yogurt",q:60,u:"g",cat:"dairy"},{n:"Onion & spices",q:0.5,u:"",cat:"produce"}], note:"Grill or pan-fry; the yogurt is the sauce."},
  {id:"l6", slot:"lunch", name:"Cheese, charcuterie, olives & fruit board", diet:["omnivore","carnivore"], tier:"standard", cost:4.5,
   ing:[{n:"Aged cheese",q:80,u:"g",cat:"dairy"},{n:"Cured meat (clean label)",q:60,u:"g",cat:"meat"},{n:"Olives",q:40,u:"g",cat:"pantry"},{n:"Fruit",q:80,u:"g",cat:"produce"}], note:"Check the deli meat's label — just meat, salt, spice."},
  {id:"l7", slot:"lunch", name:"Ground beef & sweet-potato hash", diet:["omnivore"], tier:"budget", cost:3.2,
   ing:[{n:"Ground beef (80/20)",q:150,u:"g",cat:"meat"},{n:"Sweet potato",q:150,u:"g",cat:"produce"},{n:"Onion & pepper",q:0.5,u:"",cat:"produce"},{n:"Tallow",q:10,u:"g",cat:"fats"}], note:"One pan, cheap, freezes well."},
  {id:"l8", slot:"lunch", name:"Garlic-butter shrimp & zucchini", diet:["omnivore","pescatarian"], tier:"standard", cost:4.6,
   ing:[{n:"Shrimp/prawns",q:150,u:"g",cat:"seafood"},{n:"Zucchini",q:200,u:"g",cat:"produce"},{n:"Butter",q:15,u:"g",cat:"fats"},{n:"Garlic",q:2,u:"clove",cat:"produce"}], note:"Frozen shrimp is fine — thaw, pat dry, sear hot."},
  {id:"l9", slot:"lunch", name:"Leftover roast + roasted vegetables", diet:["omnivore"], tier:"budget", cost:2.8,
   ing:[{n:"Leftover roast meat",q:150,u:"g",cat:"meat"},{n:"Root vegetables",q:200,u:"g",cat:"produce"},{n:"Butter or tallow",q:15,u:"g",cat:"fats"}], note:"Cook once, eat twice — the cheapest lunch is last night's dinner."},

  /* ---------------- DINNERS ---------------- */
  {id:"d1", slot:"dinner", name:"Ribeye, roast potatoes & greens", diet:["omnivore"], tier:"premium", cost:9.0,
   ing:[{n:"Ribeye steak",q:250,u:"g",cat:"meat"},{n:"Potatoes",q:200,u:"g",cat:"produce"},{n:"Greens (spinach/chard)",q:100,u:"g",cat:"produce"},{n:"Butter/tallow",q:20,u:"g",cat:"fats"}], note:"Salt early, sear hard, rest 8 minutes."},
  {id:"d2", slot:"dinner", name:"Whole roast chicken & root veg", diet:["omnivore"], tier:"budget", cost:3.8,
   ing:[{n:"Whole chicken (per serving)",q:250,u:"g",cat:"meat"},{n:"Carrots, onion, potato",q:250,u:"g",cat:"produce"},{n:"Butter",q:20,u:"g",cat:"fats"}], note:"Roast one, eat 2–3 meals + save the carcass for broth."},
  {id:"d3", slot:"dinner", name:"Beef chuck stew in bone broth", diet:["omnivore"], tier:"budget", cost:3.6,
   ing:[{n:"Beef chuck",q:200,u:"g",cat:"meat"},{n:"Carrot, celery, onion",q:200,u:"g",cat:"produce"},{n:"Bone broth",q:250,u:"ml",cat:"pantry"},{n:"Butter/tallow",q:15,u:"g",cat:"fats"}], note:"Low and slow 3 hours; collagen-rich and cheap."},
  {id:"d4", slot:"dinner", name:"Wild salmon, asparagus & butter", diet:["omnivore","pescatarian"], tier:"premium", cost:7.5,
   ing:[{n:"Salmon fillet",q:180,u:"g",cat:"seafood"},{n:"Asparagus",q:150,u:"g",cat:"produce"},{n:"Butter",q:15,u:"g",cat:"fats"},{n:"Lemon",q:0.25,u:"",cat:"produce"}], note:"Skin-side down 80% of the cook."},
  {id:"d5", slot:"dinner", name:"Lamb chops & big salad", diet:["omnivore"], tier:"premium", cost:8.0,
   ing:[{n:"Lamb chops",q:220,u:"g",cat:"meat"},{n:"Salad greens & tomato",q:150,u:"g",cat:"produce"},{n:"Olive oil",q:15,u:"ml",cat:"fats"}], note:"Grass-fed lamb needs nothing but salt and heat."},
  {id:"d6", slot:"dinner", name:"Ground-beef chili", diet:["omnivore"], tier:"budget", cost:3.2,
   ing:[{n:"Ground beef (80/20)",q:180,u:"g",cat:"meat"},{n:"Onion, pepper, tomato",q:200,u:"g",cat:"produce"},{n:"Kidney beans (optional)",q:80,u:"g",cat:"pantry"},{n:"Tallow & spices",q:10,u:"g",cat:"fats"}], note:"Big batch, freezes perfectly, cheaper by the pound."},
  {id:"d7", slot:"dinner", name:"Pork-shoulder carnitas & slaw", diet:["omnivore"], tier:"budget", cost:3.4,
   ing:[{n:"Pork shoulder",q:200,u:"g",cat:"meat"},{n:"Cabbage & lime slaw",q:150,u:"g",cat:"produce"},{n:"Onion",q:0.5,u:"",cat:"produce"}], note:"Slow-cook a big shoulder; it stretches across days."},
  {id:"d8", slot:"dinner", name:"Pan-seared mackerel & roasted squash", diet:["omnivore","pescatarian"], tier:"standard", cost:4.4,
   ing:[{n:"Mackerel fillets",q:180,u:"g",cat:"seafood"},{n:"Squash or pumpkin",q:200,u:"g",cat:"produce"},{n:"Butter",q:15,u:"g",cat:"fats"}], note:"Oily fish, omega-3 dense and inexpensive."},
  {id:"d9", slot:"dinner", name:"Beef meatballs, tomato & parmesan", diet:["omnivore"], tier:"standard", cost:4.0,
   ing:[{n:"Ground beef",q:180,u:"g",cat:"meat"},{n:"Tomato passata",q:150,u:"g",cat:"pantry"},{n:"Parmesan",q:30,u:"g",cat:"dairy"},{n:"Onion & garlic",q:0.5,u:"",cat:"produce"}], note:"Serve over greens or a little pasta if you're active."},
  {id:"d10", slot:"dinner", name:"Beef liver, bacon & onions", diet:["omnivore","carnivore"], tier:"budget", cost:2.8,
   ing:[{n:"Beef liver",q:120,u:"g",cat:"meat"},{n:"Bacon (clean label)",q:40,u:"g",cat:"meat"},{n:"Onion",q:1,u:"",cat:"produce"},{n:"Butter",q:10,u:"g",cat:"fats"}], note:"The most nutrient-dense dinner you can cook."},
  {id:"d11", slot:"dinner", name:"Whole roasted fish & potatoes", diet:["omnivore","pescatarian"], tier:"standard", cost:5.2,
   ing:[{n:"Whole fish (sea bream/trout)",q:300,u:"g",cat:"seafood"},{n:"Potatoes",q:200,u:"g",cat:"produce"},{n:"Olive oil & lemon",q:15,u:"ml",cat:"fats"}], note:"Whole fish is cheaper per kilo than fillets."},
  {id:"d12", slot:"dinner", name:"Grass-fed burgers & avocado (no bun)", diet:["omnivore","carnivore"], tier:"standard", cost:4.6,
   ing:[{n:"Ground beef (80/20)",q:200,u:"g",cat:"meat"},{n:"Avocado",q:0.5,u:"",cat:"produce"},{n:"Cheese (optional)",q:30,u:"g",cat:"dairy"},{n:"Butter",q:10,u:"g",cat:"fats"}], note:"Smash-fry hot; wrap in lettuce if you want a bun feel."},
  {id:"d13", slot:"dinner", name:"Slow-cooked oxtail & vegetables", diet:["omnivore"], tier:"standard", cost:5.0,
   ing:[{n:"Oxtail",q:300,u:"g",cat:"meat"},{n:"Carrot, onion, celery",q:200,u:"g",cat:"produce"},{n:"Bone broth",q:200,u:"ml",cat:"pantry"}], note:"Cheap cut, gelatin-rich, unbelievable slow-cooked."},
  {id:"d14", slot:"dinner", name:"Steak salad from last night's steak", diet:["omnivore"], tier:"budget", cost:3.0,
   ing:[{n:"Leftover steak",q:150,u:"g",cat:"meat"},{n:"Salad greens & tomato",q:150,u:"g",cat:"produce"},{n:"Blue cheese (optional)",q:20,u:"g",cat:"dairy"},{n:"Olive oil",q:12,u:"ml",cat:"fats"}], note:"Turns leftovers into a meal that feels new."}
];
