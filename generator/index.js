const frontMatter = require('front-matter')
const path = require('path')
const mainElm = require('./templates/main.elm.js')
const postsElm = require('./templates/posts.elm.js')
const indexHtml = require('./templates/index.html.js')
const fs = require('fs')

const BASE_URL = process.env.BASE_URL || 'https://rhg.dev'

const map = (fn) => (list) => list.map(fn)

// File helpers
const uncallback = (resolve, reject) => (err, data) =>
  err ? reject(err) : resolve(data)

const file = {
  read: (path) => new Promise((resolve, reject) =>
    fs.readFile(path, { encoding: 'utf8' }, uncallback(resolve, reject))
  ),
  write: ({ path, data }) => new Promise((resolve, reject) =>
    fs.writeFile(path, data, uncallback(resolve, reject))
  ),
  mkdir: (path) => new Promise((resolve, reject) =>
    fs.mkdir(path, { recursive: true }, uncallback(resolve, reject))
  ),
  dir: (path) => new Promise((resolve, reject) =>
    fs.readdir(path, { encoding: 'utf8' }, uncallback(resolve, reject))
  ),
  rmdir: (filepath) => new Promise((resolve, reject) => {
    const rimraf = (dir_path) => {
      if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function(entry) {
          const entry_path = path.join(dir_path, entry)
          if (fs.lstatSync(entry_path).isDirectory()) {
              rimraf(entry_path)
          } else {
              fs.unlinkSync(entry_path)
          }
        })
        fs.rmdirSync(dir_path)
      }
    }
    try { rimraf(filepath); resolve() }
    catch (e) { reject(e) }
  })
}

// Markdown helpers
const markdown = {
  parse: frontMatter
}

const capitalize = (word) =>
  word[0].toUpperCase() + word.substring(1)

const pascalCase = (slug) =>
  slug.split('-').map(capitalize).join('')

const quote = (str) =>
  `"${str}"`

const toElmTemplate = ({ folder, slug }) => ({ meta, markdown }) =>
  `module Content.${pascalCase(folder)}.${pascalCase(slug)} exposing (content)

import Content exposing (Content)
import Meta exposing (Meta)
import Time


content : Content
content =
    Content meta markdown


meta : Meta
meta =
    { title = ${quote(meta.title)}
    , slug = ${quote(slug)}
    , date = Time.millisToPosix ${meta.date}
    , description = ${quote(meta.description)}
    , image = ${quote(meta.image)}
    , tags = [ ${meta.tags.map(quote).join(', ')} ]
    }


markdown : String
markdown =
    """${markdown}"""
`

// Validate the markdown frontmatter
const validate = (filename) => (result) => {
  const requiredAttributes = {
    title: 'string',
    description: 'string',
    image: 'string',
    date: 'number',
    tags: 'list of strings'
  }

  const isType = (type) => (value) => typeof value === type

  const isValid = (value, type) =>
    type === 'list of strings'
      ? value instanceof Array &&
        value.every(isType('string'))
      : isType(type)(value)

  const errors =
    Object.entries(requiredAttributes)
      .filter(([ key, type ]) => !isValid(result.attributes[key], type))
      .map(([ key, type ]) =>
        `ERROR: ${filename} is missing a ${type} called "${key}" in its frontmatter.`
      )

  return errors.length > 0
    ? Promise.reject(errors[0])
    : Promise.resolve(result)
}

// Converting things to JSON
const dropExtension = (filename) =>
  filename.substring(0, filename.length - '.md'.length)

const convert = (folder, filename) => {
  return file.read(path.join(folder, filename))
    .then(markdown.parse)
    .then(validate(filename))
    .then(data => ({
      module: pascalCase(dropExtension(filename)),
      slug: dropExtension(filename),
      meta: {
        ...data.attributes,
        url: `${baseUrl}/posts/${dropExtension(filename)}`
      },
      markdown: data.body
    }))
}

const convertInDir = (folder) =>
  file.dir(folder)
    .then(map(filename => convert(folder, filename).then(data => ({ filename, data }))))
    .then(promises => Promise.all(promises))

const removeExistingContent = _ =>
  Promise.all([
    file.rmdir('dist'),
    file.rmdir('src/Content')
  ])

const createFolders = folder => _ =>
  Promise.all([
    file.mkdir(`src/Content/${pascalCase(folder)}`),
    file.mkdir(`dist/${folder}`)
  ])

const generateFiles = (folder) => (results) =>
  Promise.all([
    // dist/**/*.html
    Promise.all([
      file.write({
        path: 'dist/index.html',
        data: indexHtml({
          meta: {
            title: 'rhg.dev',
            description: 'the coolest website ever tho',
            url: BASE_URL,
            image: 'https://avatars2.githubusercontent.com/u/6187256'
          }
        })
      }),
      file.write({
        path: 'dist/posts.html',
        data: indexHtml({
          meta: {
            title: 'posts | rhg.dev',
            description: 'the coolest website ever tho',
            url: BASE_URL + '/posts',
            image: 'https://avatars2.githubusercontent.com/u/6187256'
          }
        })
      }),
      ...results.map(({ data }) => file.write({
        path: `dist/${folder}/${data.slug}.html`,
        data: indexHtml(data)
      }))
    ]),
    // src/Main.elm
    file.write({
      path: 'src/Main.elm',
      data: mainElm(results.map(({ data }) => data))
    }),
    // src/Posts.elm
    file.write({
      path: 'src/Posts.elm',
      data: postsElm(results.map(({ data }) => data))
    }),
    // src/Content/Posts/*.elm
    results.map(({ filename, data }) => file.write({
      path: `src/Content/${pascalCase(folder)}/${data.module}.elm`,
      data: toElmTemplate({ folder, slug: dropExtension(filename) })(data)
    }))
  ])

// The entrypoint to the generator
const main = (folder) =>
  removeExistingContent()
    .then(createFolders(folder))
    .then(_ => convertInDir(folder))
    .then(generateFiles(folder))
    .catch(console.error)

main('posts')
