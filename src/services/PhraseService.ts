import { GcpService } from './GcpService'
import { IPhrase } from '../models'
import { logger } from '../logging'
import { isNull, isUndefined } from 'lodash'

export class PhraseService {
  private static it: PhraseService
  protected COLLECTION_NAME = 'sentences'

  constructor (private gcpService: GcpService) {
  }

  static IT (gcpService: GcpService): PhraseService {
    if (isNull(this.it) || isUndefined(this.it)) {
      this.it = new PhraseService(gcpService)
    }

    return this.it
  }

  async addPhrase (phrase: string, category: string) {
    const dto = this.toPhraseDto(phrase, category)

    const exists = await this.gcpService.exists(this.COLLECTION_NAME, 'input', phrase)

    if (exists) {
      return dto
    }

    return this.gcpService.store(this.COLLECTION_NAME, dto)
      .then(value => {
        logger.info('Phrase Stored', { dto })
        return value
      })
      .catch(reason => {
        logger.error('Storing Phrase threw an exception', { reason })
        throw new Error('Storing Phrase failed')
      })
  }

  toPhraseDto (phrase: string, category: string): IPhrase {
    return {
      input: phrase,
      output: category
    }
  }

  batchAddPhrase (phraseData: any[]) {
    const phraseDTOs = phraseData.map(value => {
      return this.toPhraseDto(value.attributes.text, value.attributes.category)
    })

    const requests = phraseDTOs.map(value => {
      return this.gcpService.store(this.COLLECTION_NAME, value)
    })

    return Promise.all(requests)
  }
}
