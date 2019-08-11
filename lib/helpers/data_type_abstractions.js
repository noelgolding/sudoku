class Config extends Object {
  constructor(label, properties) {
    super()
    this.label = label
    properties = properties || {}
    for (let key in properties) {
      this.set(key, properties[key])
    }
  }

  set(key, value) {
    this[this._getKey(key)] = value
  }
  add = this.set

  _getKey(key) {
    let l_key = key.toLowerCase()
    for (let k in this) {
      if (k.toLowerCase() === l_key) {
        return k
      }
    }
    return key
  }
}

class List extends Array {
  constructor(...items) {
    super(...items)
  }

  add = this.push

  get(i) {
    return this[i]
  }

  remove(i) {
    let value = this.get(i)
    this.splice(i, 1)
    return value
  }

  shuffle() {
    let currIdx = this.length
    let tempVal, randIdx

    while (0 != currIdx) {
      randIdx = random(0, currIdx - 1)
      currIdx -= 1

      tempVal = this[currIdx]
      this[currIdx] = this[randIdx]
      this[randIdx] = tempVal
    }

    return this
  }
}