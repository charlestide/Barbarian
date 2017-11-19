
exports = module.exports =

{
  default: {
    base: [
        /^module-name(\.min)?$/g
    ],
    plugin: [
        /^module-name-([\w]+)/g
    ],
    pro: [
        /\.min$/g
    ],
    bundle: [
        /\.bundle$(\.min)?/g,
    ]
  },
  bootstrap: {
  }
};