/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 29.01.13
 * Time: 12:34
 */
var _fs = require('fs'),
    _path = require('path');

var __dbuilder = module.exports = exports;

__dbuilder.Dbuilder = function (params)
{
    params = params || {};

    var self = this,

        templatesPath = params.templatesPath,
        structure = params.structure,
        destination = params.destionation;

    /**
     * Задание пути к директории с шаблонами
     *
     * @param path
     *
     * @returns {*}
     */
    self.setTemplatesPath = function (path)
    {
        templatesPath = path;

        return self;
    };

    /**
     * Задание директории назначения
     *
     * @param dest
     *
     * @returns {*}
     */
    self.setDestination = function (dest)
    {
        destination = dest;

        return self;
    };

    /**
     * Задание структуры директорий
     *
     * @param struct
     *
     * @returns {*}
     */
    self.setStructure = function (struct)
    {
        structure = struct;

        return self;
    };

    /**
     * Построение структуры директорий
     *
     * @param struct
     * @param dest
     *
     * @returns {*}
     */
    self.build = function build (struct, dest)
    {
        struct = struct || structure;
        dest = dest || destination;

        if (!struct || !dest)
        {
            return false;
        }

        if (!_path.existsSync(dest) || !_fs.lstatSync(dest).isDirectory())
        {
            _fs.mkdirSync(dest);
        }

        console.log('Была создана следующая структура каталогов:\n');
        console.log(dest);

        (function bypass (struct, dest, space)
        {
            space = space || '';

            var count = 1,
                number = Object.keys(struct).length;

            for (var name in struct)
            {
                var objStruct = struct[name],
                    path = dest + '/' + name,
                    type = objStruct.type || 'dir';

                if (type === 'dir')
                {
                    if (!_path.existsSync(path))
                    {
                        _fs.mkdirSync(path);

                        if (count === number)
                        {
                            console.log(space + '└ ' + name);
                        }
                        else
                        {
                            if (space === '' && count === 1)
                            {
                                console.log(space + '│');
                            }

                            console.log(space + '├ ' + name);
                        }
                    }

                    if (objStruct.include !== undefined)
                    {
                        bypass(objStruct.include, path, (count < number ? space + '│ ' : space + '  '));
                    }
                }
                else
                {
                    if (!_path.existsSync(path))
                    {
                        var content = '';
                        if (templatesPath && objStruct.template !== undefined)
                        {
                            var templates = objStruct.template.split(',');

                            templates.map(function (template)
                            {
                                var pathToTemplate = _path.resolve(templatesPath + '/' + template);

                                if (_path.existsSync(pathToTemplate) && _fs.lstatSync(pathToTemplate).isFile())
                                {
                                    content += _fs.readFileSync(pathToTemplate);
                                }
                            });
                        }
                        else if (objStruct.content !== undefined)
                        {
                            content = objStruct.content;
                        }

                        _fs.writeFileSync(path, content, 'UTF-8');

                        if (number > count)
                        {
                            console.log(space + '├ ' + name);
                        }
                        else
                        {
                            console.log(space + '└ ' + name);
                        }
                    }
                }

                count++;
            }
        })(struct, dest);

        return self;
    };
};