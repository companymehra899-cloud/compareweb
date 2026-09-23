export const PRODUCT_IMAGES = {
  'thinkpad-e14': {
    src: '/assets/products/thinkpad-e14.jpg',
    credit: 'Jemimus',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/12967790@N00/6461588275'
  },
  'vivobook-16': {
    src: '/assets/products/vivobook-16.jpg',
    credit: 'Devan Hsu',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    source: 'https://commons.wikimedia.org/w/index.php?curid=110320859'
  },
  'swift-3': {
    src: '/assets/products/swift-3.jpg',
    credit: 'Donald Trung',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/w/index.php?curid=87463600'
  },
  'pavilion-15': {
    src: '/assets/products/pavilion-15.jpg',
    credit: 'Srini297',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/w/index.php?curid=113356848'
  },
  'macbook-air-m3': {
    src: '/assets/products/macbook-air-m3.jpg',
    credit: 'Image Catalog',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://www.flickr.com/photos/132795455@N08/17869117540'
  },
  'tuf-a15': {
    src: '/assets/products/tuf-a15.jpg',
    credit: 'HuangWending18072009',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/w/index.php?curid=170702947'
  },
  'framework-13': {
    src: '/assets/products/framework-13.jpg',
    credit: 'Sean MacEntee',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/18090920@N07/5918067297'
  },
  'ideapad-slim5': {
    src: '/assets/products/ideapad-slim5.jpg',
    credit: 'liewcf',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    source: 'https://www.flickr.com/photos/34353636@N00/3968280888'
  },
  'sony-xm5': {
    src: '/assets/products/sony-xm5.jpg',
    credit: 'rawpixel',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://www.rawpixel.com/image/3301986/free-photo-image-headphones-music-background'
  },
  'galaxy-s24': {
    src: '/assets/products/galaxy-s24.jpg',
    credit: 'Ke En',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    source: 'https://commons.wikimedia.org/w/index.php?curid=163268145'
  },
  'apple-watch-s9': {
    src: '/assets/products/apple-watch-s9.jpg',
    credit: 'One Idea LLC',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://stocksnap.io/photo/apple-watch-6EMBFCXU0J'
  },
  'lg-c4-55': {
    src: '/assets/products/lg-c4-55.jpg',
    credit: 'LGEPR',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/32985045@N08/6616140965'
  }
}

export function productImage(product) {
  return PRODUCT_IMAGES[product?.id] || null
}
