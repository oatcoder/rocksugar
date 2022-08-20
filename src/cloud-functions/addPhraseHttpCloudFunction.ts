import { Request, Response } from 'express'
import { GcpService, PhraseService } from '../services'
import { getGcpProjectId, getGcpTopicName } from '../env'
import { isArray } from 'lodash'

export function addPhrase (req: Request, res: Response) {
  res.type('application/json')

  if (req.method !== 'POST') {
    return res.status(500).send({}).end()
  }

  if (!req.body) {
    return res.status(500).send({}).end()
  }

  const gcpConfig = {
    projectId: getGcpProjectId(),
    topicName: getGcpTopicName()
  }

  const phraseService = PhraseService.IT(new GcpService(gcpConfig))

  const { data } = req.body

  const addPhrasePromise: Promise<any> = isArray(data) ?
    phraseService.batchAddPhrase(data)
    :
    phraseService.addPhrase(data.attributes.text, data.attributes.category)

  return addPhrasePromise
    .then(value => {
      return res.status(200).send(value).end()
    }).catch(reason => {
      return res.status(500).send(reason).end()
    })
}
