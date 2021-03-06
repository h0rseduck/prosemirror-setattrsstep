import { Fragment, Slice } from 'prosemirror-model'
import { Step, StepResult } from 'prosemirror-transform'

const STEP_TYPE = 'setAttrs'

/**
 * For more context on what this is about:
 * @see https://discuss.prosemirror.net/t/preventing-image-placeholder-replacement-from-being-undone/1394
 */
export default class SetAttrsStep extends Step {
  constructor (pos, attrs) {
    super()
    this.pos = pos
    this.attrs = attrs
  }

  apply (doc) {
    const target = doc.nodeAt(this.pos)
    if (!target) {
      return StepResult.fail('No node at given position')
    }

    const attrs = {
      ...(target.attrs || {}),
      ...(this.attrs || {})
    }

    const newNode = target.type.create(attrs, Fragment.empty, target.marks)
    const slice = new Slice(Fragment.from(newNode), 0, target.isLeaf ? 0 : 1)
    return StepResult.fromReplace(doc, this.pos, this.pos + 1, slice)
  }

  invert (doc) {
    const target = doc.nodeAt(this.pos)
    return new SetAttrsStep(this.pos, target ? target.attrs : {})
  }

  map (mapping) {
    const result = mapping.mapResult(this.pos, 1)
    return result.deleted ? null : new SetAttrsStep(result.pos, this.attrs)
  }

  toJSON () {
    return { stepType: STEP_TYPE, pos: this.pos, attrs: this.attrs }
  }

  static fromJSON (_schema, json) {
    if (
      typeof json.pos !== 'number' ||
      (json.attrs !== null && typeof json.attrs !== 'object')
    ) {
      throw new RangeError('Invalid input for SetAttrsStep.fromJSON')
    }
    return new SetAttrsStep(json.pos, json.attrs)
  }
}

Step.jsonID(STEP_TYPE, SetAttrsStep)
