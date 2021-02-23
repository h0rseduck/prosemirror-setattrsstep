import { Step, StepResult } from 'prosemirror-transform'
import set from 'lodash/set'
import get from 'lodash/get'

const STEP_TYPE = 'SetTokenStep'
export const TOKEN_ATTR = 'tokens'

export default class SetTokenStep extends Step {
  constructor (id, value) {
    super()
    this.id = id
    this.value = value
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    const path = [TOKEN_ATTR, this.id, 'value']
    this.prevValue = get(doc.attrs, path, '')

    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)

    if (Array.isArray(doc.attrs[TOKEN_ATTR])) {
      doc.attrs[TOKEN_ATTR] = {}
    }
    set(doc.attrs, path, this.value)
    return StepResult.ok(doc)
  }

  invert () {
    return new SetTokenStep(this.id, this.prevValue)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      id: this.id,
      value: this.value
    }
  }

  static fromJSON (schema, json) {
    return new SetTokenStep(json.id, json.value)
  }
}

Step.jsonID(STEP_TYPE, SetTokenStep)