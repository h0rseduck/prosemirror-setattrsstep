import { Step, StepResult } from 'prosemirror-transform'
import set from 'lodash/set'
import unset from 'lodash/unset'
import get from 'lodash/get'

const STEP_TYPE = 'SetDocAttrStep'

export default class SetDocAttrStep extends Step {
  constructor (path, value) {
    super()
    this.path = path
    this.value = value
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    this.prevValue = get(doc.attrs, this.path, null)
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)
    if (this.value === null) {
      unset(doc.attrs, this.path)
    } else {
      set(doc.attrs, this.path, this.value)
    }
    return StepResult.ok(doc)
  }

  invert () {
    return new SetDocAttrStep(this.path, this.prevValue)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      path: this.path,
      value: this.value
    }
  }

  static fromJSON (schema, json) {
    return new SetDocAttrStep(json.path, json.value)
  }
}

Step.jsonID(STEP_TYPE, SetDocAttrStep)