import { Step, StepResult } from 'prosemirror-transform'
import set from 'lodash/set'
import unset from 'lodash/unset'
import get from 'lodash/get'
import has from 'lodash/has'

const STEP_TYPE = 'SetTokenStep'
const STEP_ACTION_ATTRS = 'attrs'
const STEP_ACTION_VALUE = 'value'
const TOKEN_ATTR = 'tokens'

export default class SetTokenStep extends Step {
  constructor (action, id, value) {
    super()
    this.action = action
    this.id = id
    this.value = value
  }

  get stepType () { return STEP_TYPE }

  apply (doc) {
    if (![STEP_ACTION_ATTRS, STEP_ACTION_VALUE].includes(this.action)) {
      return StepResult.fail('Unknown action')
    }
    // avoid clobbering doc.type.defaultAttrs
    if (doc.attrs === doc.type.defaultAttrs) doc.attrs = Object.assign({}, doc.attrs)

    const path = [TOKEN_ATTR, this.id]
    const pathAttr = [ ...path, this.action ]
    const hasToken = has(doc.attrs, path)
    this.prevValue = get(doc.attrs, pathAttr, null)
    
    switch (this.action) {
      case STEP_ACTION_ATTRS: {
        if (this.value === null) {
          unset(doc.attrs, path)
        } else if (!hasToken) {
          set(doc.attrs, path, {
            attrs: this.value,
            value: ''
          })
        } else {
          set(doc.attrs, pathAttr, this.value)
        }
        break
      }
      case STEP_ACTION_VALUE: {
        if (!hasToken) {
          return StepResult.fail('Not found token')
        }
        set(doc.attrs, pathAttr, this.value)
        break
      }
    }

    return StepResult.ok(doc)
  }

  invert () {
    return new SetTokenStep(this.action, this.id, this.prevValue)
  }

  // position never changes so map should always return same step
  map () { return this }

  toJSON () {
    return {
      stepType: this.stepType,
      action: this.action,
      id: this.id,
      value: this.value
    }
  }

  static fromJSON (schema, json) {
    return new SetTokenStep(json.action, json.id, json.value)
  }

  static attrsStep (id, value) {
    return new SetTokenStep(STEP_ACTION_ATTRS, id, value)
  }

  static valueStep (id, value) {
    return new SetTokenStep(STEP_ACTION_VALUE, id, value)
  }
}

Step.jsonID(STEP_TYPE, SetTokenStep)