import { Step, StepResult } from 'prosemirror-transform'

const STEP_TYPE = 'setDocItemAttr'

const hasItemKey = (attrs, item, key) => {
  return attrs[item] && Object.prototype.hasOwnProperty.call(attrs[item], key)
}

export default class SetDocItemAttrStep extends Step {
  constructor (item, key, value) {
    super()
    this.item = item
    this.key = key
    this.value = value
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    this.prevValue = hasItemKey(doc.attrs, this.item, this.key) ? doc.attrs[this.item][this.key] : false
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)
    if (!this.value) {
      if (hasItemKey(doc.attrs, this.item, this.key)) delete doc.attrs[this.item][this.key]
    } else {
      doc.attrs[this.item][this.key] = this.value
    }
    return StepResult.ok(doc)
  }

  invert () {
    return new SetDocItemAttrStep(this.item, this.key, this.prevValue)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      item: this.item,
      key: this.key,
      value: this.value
    }
  }

  static fromJSON (schema, json) {
    return new SetDocItemAttrStep(json.item, json.key, json.value)
  }
}

Step.jsonID(STEP_TYPE, SetDocItemAttrStep)