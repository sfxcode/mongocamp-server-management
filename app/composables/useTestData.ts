export interface TestDataStep {
  key: string
  /** Shown as it is: collection and bucket names are not translated */
  label: string
  run: () => Promise<void>
}

interface CollectionSeed {
  collection: string
  /** File name in /data, without the extension */
  file: string
  indexes: string[]
}

const COLLECTIONS: CollectionSeed[] = [
  { collection: 'test_customer', file: 'Customer', indexes: ['id', 'lastName'] },
  { collection: 'test_order', file: 'Order', indexes: ['id', 'customerId', 'addressId'] },
  // Its rows carry no `id`, so only the two references are indexed
  { collection: 'test_order_product', file: 'OrderProduct', indexes: ['orderId', 'productId'] },
  { collection: 'test_address', file: 'Address', indexes: ['id'] },
  { collection: 'test_product', file: 'Product', indexes: ['id'] },
  { collection: 'test_cart', file: 'Cart', indexes: ['id', 'customerId'] },
]

const BUCKET = 'test_images'

const IMAGES = [
  { fileName: 'red-square.png', color: '#e5484d' },
  { fileName: 'green-square.png', color: '#30a46c' },
  { fileName: 'blue-square.png', color: '#3e63dd' },
  { fileName: 'yellow-square.png', color: '#f5d90a' },
  { fileName: 'purple-square.png', color: '#8e4ec6' },
]

const CHUNK_SIZE = 100

/** A 32×32 PNG in one colour, drawn in the browser. */
function squarePng(color: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    if (!context) {
      reject(new Error('Canvas is not available'))
      return
    }
    context.fillStyle = color
    context.fillRect(0, 0, 32, 32)
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image could not be created')), 'image/png')
  })
}

/**
 * The demo data set: six linked shop collections (from /data/*.json) and one image bucket.
 * Goes through the client API, so it also works in server proxy mode.
 */
export function useTestData() {
  const { collectionApi, documentApi, indexApi, fileApi, bucketApi } = useMongocampClientApi()

  async function dropAll() {
    // A collection or bucket that is not there is fine
    await Promise.all([
      ...COLLECTIONS.map(({ collection }) => collectionApi.deleteCollection({ collectionName: collection }).catch(() => {})),
      bucketApi.deleteBucket({ bucketName: BUCKET }).catch(() => {}),
    ])
  }

  async function seedCollection(seed: CollectionSeed) {
    await collectionApi.deleteCollection({ collectionName: seed.collection }).catch(() => {})
    const rows = await $fetch<Record<string, unknown>[]>(`/data/${seed.file}.json`)
    for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
      await documentApi.insertMany({ collectionName: seed.collection, requestBody: rows.slice(start, start + CHUNK_SIZE) })
    }
    for (const field of seed.indexes) {
      await indexApi.createIndex({ collectionName: seed.collection, indexCreateRequest: { keys: { [field]: 1 } } })
    }
  }

  async function seedImages() {
    await bucketApi.deleteBucket({ bucketName: BUCKET }).catch(() => {})
    for (const image of IMAGES) {
      await fileApi.insertFile({
        bucketName: BUCKET,
        file: await squarePng(image.color),
        fileName: image.fileName,
        metaData: JSON.stringify({ contentType: 'image/png' }),
      })
    }
  }

  /** The reset as an ordered list of steps; `drop` comes first and is labelled by the caller. */
  const resetSteps: TestDataStep[] = [
    { key: 'drop', label: '', run: dropAll },
    ...COLLECTIONS.map(seed => ({ key: seed.collection, label: seed.collection, run: () => seedCollection(seed) })),
    { key: BUCKET, label: BUCKET, run: seedImages },
  ]

  return {
    resetSteps,
    dropAll,
    /** What the set consists of, to tell whether some of it is already on the server */
    collectionNames: COLLECTIONS.map(seed => seed.collection),
    bucketName: BUCKET,
  }
}
