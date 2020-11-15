import { Step, StepResult } from 'prosemirror-transform'

const STEP_TYPE = 'setDocAttr'

/**
 * For more context on what this is about:
 * @see https://discuss.prosemirror.net/t/changing-doc-attrs/784
 */
export default class SetDocAttrStep extends Step {
  constructor (key, value) {
    super()
    this.key = key
    this.value = value
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    this.prevValue = doc.attrs[this.key]
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)
    doc.attrs[this.key] = this.value
    return StepResult.ok(doc)
  }

  invert () {
    return new SetDocAttrStep(this.key, this.prevValue)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      key: this.key,
      value: this.value
    }
  }

  static fromJSON (schema, json) {
    return new SetDocAttrStep(json.key, json.value)
  }
}

Step.jsonID(STEP_TYPE, SetDocAttrStep)