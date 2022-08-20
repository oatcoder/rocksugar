import { Firestore, DocumentData } from '@google-cloud/firestore'
import { IStoreResponse } from '../models'
import { isUndefined } from 'lodash'

export class GcpService {
  private firestore: Firestore

  constructor (private gcpConfig: any) {
    this.firestore = new Firestore({ projectId: gcpConfig.projectId })
  }

  async store (collection: string, data: any) {
    return this.firestore.collection(collection)
      .doc()
      .set(data)
      .then(value => {
        return {
          id: data.id,
          successful: !isUndefined(value) && !isUndefined(value.writeTime),
          timestamp: value?.writeTime?.seconds
        } as IStoreResponse
      })
  }

  async exists (collection: string, attributeName: string, value: string): Promise<boolean> {
    const existing = await this.find(collection, attributeName, value)

    return existing.length !== 0
  }

  async find (collection: string, attributeName: string, value: string): Promise<any[]> {
    return this.firestore.collection(collection)
      .where(attributeName, '==', value).get()
      .then(data => {
        const result: any[] = []

        data.forEach((documentData: DocumentData) => {
          const data = documentData.data()

          result.push(<any>{
            input: data.input,
            output: data.output
          })
        })

        return result
      })
  }
}
