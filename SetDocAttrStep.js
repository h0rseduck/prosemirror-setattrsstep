import { Step, StepResult } from 'prosemirror-transform'
import has from 'lodash/has'
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
    if (!this.path) {
      this.prevValue = doc.attrs
      if (!this.value) {
        doc.attrs = {}
      } else {
        doc.attrs = this.value
      }
      return StepResult.ok(doc)
    }

    this.prevValue = has(doc.attrs, this.path) ? get(doc.attrs, this.path) : false
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)
    if (!this.value) {
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