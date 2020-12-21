import { Step, StepResult } from 'prosemirror-transform'
import has from 'lodash/has'
import set from 'lodash/set'
import unset from 'lodash/unset'
import get from 'lodash/get'
import isPlainObject from 'lodash/isPlainObject'

const STEP_TYPE = 'SetDocAttrStep'

export default class SetDocAttrStep extends Step {
  constructor (path, value, isUpdate = false) {
    super()
    this.path = path
    this.value = value
    this.isUpdate = isUpdate
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    if (!this.path) {
      this.prevValue = doc.attrs
      if (!this.value) {
        doc.attrs = {}
      } else if (!this.isUpdate) {
        doc.attrs = this.value
      } else if (isPlainObject(this.value)) {
        doc.attrs = { ...doc.attrs, ...this.value }
      }
      return StepResult.ok(doc)
    }

    this.prevValue = has(doc.attrs, this.path) ? get(doc.attrs, this.path) : false
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)
    if (!this.value) {
      unset(doc.attrs, this.path)
    } else if (!this.isUpdate) {
      set(doc.attrs, this.path, this.value)
    } else if (isPlainObject(this.prevValue) && isPlainObject(this.value)) {
      set(doc.attrs, this.path, { ...this.prevValue, ...this.value })
    }
    return StepResult.ok(doc)
  }

  invert () {
    return new SetDocAttrStep(this.path, this.prevValue, false)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      path: this.path,
      value: this.value,
      isUpdate: this.isUpdate
    }
  }

  static fromJSON (schema, json) {
    return new SetDocAttrStep(json.path, json.value, json.isUpdate)
  }
}

Step.jsonID(STEP_TYPE, SetDocAttrStep)