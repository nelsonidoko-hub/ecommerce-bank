// A small drawing (emoji) for each kind of product, so a dummy picture shows
// what the thing is. First match wins. Kept in step with the backend's
// utils/sampleData.js (the pictures on sample products).
export const PICTURE_ICONS = [
  [/backpack|school bag/i, "🎒"],
  [/sneaker|shoe|slides|sandal|runner|court 90s|volt edge|zenith flow|street vibe|nova horizon|pulse react|street retro|aeroflex|street pro/i, "👟"],
  [/sofa|couch/i, "🛋️"],
  [/chair|stool/i, "🪑"],
  [/vase/i, "🏺"],
  [/coffee table|side table/i, "🪵"],
  [/sun hat|straw hat/i, "👒"],
  [/cap\b|hat\b/i, "🧢"],
  [/dress|gown/i, "👗"],
  [/hoodie|jacket|coat/i, "🧥"],
  [/trouser|pants|jeans|shorts/i, "👖"],
  [/scarf/i, "🧣"],
  [/tee\b|t-shirt|shirt|top\b/i, "👕"],
  [/tote|clutch|bag|purse/i, "👜"],
  [/belt|tie\b/i, "👔"],
  [/romper|baby wear/i, "👶"],
  [/feeding|bottle set|baby/i, "🍼"],
  [/teddy|plush|toy/i, "🧸"],
  [/blocks|lego/i, "🧱"],
  [/crayon|art kit|paint/i, "🖍️"],
  [/jollof|fried rice|ofada|rice/i, "🍛"],
  [/small chops|platter|suya/i, "🍢"],
  [/soup|stew/i, "🍲"],
  [/cake|pastry|bread/i, "🍰"],
  [/zobo|chapman|juice|drink|smoothie/i, "🍹"],
  [/water bottle|flask/i, "🥤"],
  [/frying pan|pan\b|pot\b/i, "🍳"],
  [/kettle|tea/i, "☕"],
  [/blender/i, "🥤"],
  [/fan\b/i, "🌀"],
  [/bulb|lamp|light/i, "💡"],
  [/towel/i, "🛁"],
  [/storage|container/i, "🥡"],
  [/extension|socket|charger|cable/i, "🔌"],
  [/clock/i, "🕰️"],
  [/lip|lipstick|gloss/i, "💄"],
  [/mist|perfume|fragrance/i, "🌸"],
  [/lotion|cream|serum|butter|soap|oil|cleanser/i, "🧴"],
  [/earbud|headphone|earphone/i, "🎧"],
  [/speaker/i, "🔊"],
  [/power bank|battery/i, "🔋"],
  [/watch/i, "⌚"],
  [/phone|case/i, "📱"],
  [/laptop|computer/i, "💻"],
  [/book/i, "📚"],
  [/plant|flower/i, "🪴"],
  [/new arrivals|collection|sale/i, "🛍️"],
]
export const pictureIcon = (label) => PICTURE_ICONS.find(([re]) => re.test(String(label)))?.[1] || '🛍️'

// Dummy products for template previews, by the kind of shop (the sample set).
// Generated from the backend sample products so names match the Studio photo
// slots exactly (a photo uploaded for "Electric Kettle 1.7L" shows here too).
export const PREVIEW_SETS = {
  classic: {
    menu: [
      "Clothing",
      "Accessories"
    ],
    banner: "New Season",
    products: [
      [
        "Classic Cotton Tee",
        "₦8,500",
        "Soft everyday tee in…"
      ],
      [
        "Canvas Tote Bag",
        "₦6,500",
        "Roomy tote for work,…"
      ],
      [
        "Leather Belt",
        "₦7,000",
        "Full-grain leather with…"
      ],
      [
        "Denim Jacket",
        "₦22,000",
        "A wardrobe staple that…"
      ]
    ]
  },
  minimal: {
    menu: [
      "Women",
      "Accessories"
    ],
    banner: "The Edit",
    products: [
      [
        "Linen Wrap Dress",
        "₦28,000",
        "Relaxed linen dress…"
      ],
      [
        "Silk Scarf",
        "₦12,000",
        "Lightweight silk in a…"
      ],
      [
        "Wide-Leg Trousers",
        "₦21,000",
        "Tailored drape,…"
      ],
      [
        "Straw Sun Hat",
        "₦9,000",
        "Handwoven straw with a…"
      ]
    ]
  },
  bold: {
    menu: [
      "Streetwear",
      "Sneakers"
    ],
    banner: "DROP 04",
    products: [
      [
        "Graphic Hoodie",
        "₦25,000",
        "Heavyweight fleece,…"
      ],
      [
        "Cargo Pants",
        "₦23,000",
        "Six pockets, tapered leg"
      ],
      [
        "High-Top Sneakers",
        "₦42,000",
        "Chunky sole, all-day grip"
      ],
      [
        "Snapback Cap",
        "₦8,000",
        "Flat brim, embroidered…"
      ]
    ]
  },
  fresh: {
    menu: [
      "Meals",
      "Drinks"
    ],
    banner: "Hot & Fresh Today",
    products: [
      [
        "Party Jollof Rice",
        "₦3,500",
        "Smoky jollof with fried…"
      ],
      [
        "Fried Rice Special",
        "₦3,500",
        "With mixed vegetables,…"
      ],
      [
        "Small Chops Platter",
        "₦6,000",
        "Puff-puff, samosa,…"
      ],
      [
        "Ofada Rice & Sauce",
        "₦4,000",
        "Local rice with spicy…"
      ]
    ]
  },
  catalog: {
    menu: [
      "Home",
      "Kitchen"
    ],
    banner: "Deals this week",
    products: [
      [
        "Non-Stick Frying Pan",
        "₦12,500",
        "28 cm, works on gas and…"
      ],
      [
        "Electric Kettle 1.7L",
        "₦15,000",
        "Boils in under 4 minutes"
      ],
      [
        "Rechargeable Fan",
        "₦28,000",
        "Up to 8 hours on one…"
      ],
      [
        "LED Bulb Pack of 4",
        "₦4,500",
        "Warm white, low power"
      ]
    ]
  },
  glow: {
    menu: [
      "Skincare",
      "Body"
    ],
    banner: "Your glow, naturally",
    products: [
      [
        "Vitamin C Serum",
        "₦14,000",
        "Brightening serum for…"
      ],
      [
        "Raw Shea Butter",
        "₦4,500",
        "Pure unrefined shea…"
      ],
      [
        "Hydrating Face Cream",
        "₦12,000",
        "Light, non-greasy, all…"
      ],
      [
        "Body Mist",
        "₦9,000",
        "Soft floral scent that…"
      ]
    ]
  },
  tech: {
    menu: [
      "Phones",
      "Audio"
    ],
    banner: "Latest gadgets",
    products: [
      [
        "Wireless Earbuds",
        "₦25,000",
        "Noise reduction and…"
      ],
      [
        "Power Bank 20000mAh",
        "₦18,000",
        "Charges two phones at once"
      ],
      [
        "Fast Charger 25W",
        "₦9,000",
        "USB-C fast charging"
      ],
      [
        "Bluetooth Speaker",
        "₦32,000",
        "Waterproof, 12 hours of…"
      ]
    ]
  },
  playful: {
    menu: [
      "Baby",
      "Toys"
    ],
    banner: "Fun for little ones",
    products: [
      [
        "Baby Romper",
        "₦7,500",
        "Soft cotton with easy…"
      ],
      [
        "Plush Teddy Bear",
        "₦9,000",
        "Extra soft and safe for…"
      ],
      [
        "Building Blocks Set",
        "₦15,000",
        "120 colourful pieces"
      ],
      [
        "Kids School Backpack",
        "₦12,000",
        "Padded straps, bottle…"
      ]
    ]
  }
}

// A template's own products ("My own products" in the Studio), as a preview set
function customSet(samples) {
  const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
  const products = (samples.products || []).slice(0, 4).map((p) => [p.name, naira(p.price), (p.description || '').slice(0, 26), p.image || ''])
  return { menu: (samples.categories || []).slice(0, 2).map((c) => c.label), banner: samples.heading || 'Welcome', products }
}
export const previewSet = (id, samples) => (id === 'custom' && samples?.products?.length ? customSet(samples) : PREVIEW_SETS[id] || PREVIEW_SETS.classic)

// Gadget and Atelier start with the same products as Tech and Minimal
PREVIEW_SETS.gadget = { ...PREVIEW_SETS.tech, banner: 'Top deals today' }
PREVIEW_SETS.atelier = { ...PREVIEW_SETS.minimal, banner: 'The new collection' }

// Furnish and Bloom (from the backend's sample products)
PREVIEW_SETS.furnish = {
  "menu": [
    "Chairs",
    "Sofas"
  ],
  "banner": "Furniture that feels like home",
  "products": [
    [
      "Modern Lounge Chair",
      "₦59,000",
      "Curved oak frame with a…"
    ],
    [
      "Comfy Home-Office Sofa",
      "₦245,000",
      "Deep seats and firm…"
    ],
    [
      "Arc Floor Lamp",
      "₦48,000",
      "Warm light that reaches…"
    ],
    [
      "High Back Office Chair",
      "₦85,000",
      "Tall back, padded arms…"
    ],
    [
      "Royal Comfort Sofa",
      "₦320,000",
      "Hand-finished,…"
    ],
    [
      "Glass Coffee Table",
      "₦95,000",
      "Tempered glass top on a…"
    ],
    [
      "Wooden Side Table",
      "₦35,000",
      "Small, sturdy and just…"
    ],
    [
      "Metal Wall Clock",
      "₦18,000",
      "Brushed metal with…"
    ],
    [
      "Ceramic Table Vase",
      "₦12,000",
      "Matte glaze, made by…"
    ]
  ]
}
PREVIEW_SETS.bloom = {
  "menu": [
    "Running",
    "Lifestyle"
  ],
  "banner": "Step into style",
  "products": [
    [
      "AirFlex Runner",
      "₦45,000",
      "Lightweight runners…"
    ],
    [
      "Urban Street Pro",
      "₦52,000",
      "Minimal everyday…"
    ],
    [
      "Classic Court 90s",
      "₦39,000",
      "Retro tennis-court…"
    ],
    [
      "Volt Edge",
      "₦62,000",
      "Bold details and…"
    ],
    [
      "Zenith Flow",
      "₦68,000",
      "Soft knit upper with a…"
    ],
    [
      "Street Vibe Low",
      "₦35,000",
      "A timeless low-top that…"
    ],
    [
      "Nova Horizon",
      "₦58,000",
      "High-top in suede and…"
    ],
    [
      "Pulse React",
      "₦52,000",
      "Springy cushioning for…"
    ],
    [
      "Core Street Retro",
      "₦44,000",
      "Old-school basketball…"
    ]
  ]
}
