/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 29.01.13
 * Time: 12:34
 */
var $fs = require('fs'),
    $path = require('path'),

    fsUtil = require('./utils/fs');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.Dbuilder = Dbuilder;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Dbuilder ()
{
    /**
     * Путь к директории с шаблонами
     * 
     * @type {String}
     * @private
     */
    this._templatesPath = null;

    /**
     * Путь к директории назначения
     * 
     * @type {String}
     * @private
     */
    this._destination = null;

    /**
     * Структура директорий
     *
     * @type {Object}
     * @private
     */
    this._struct = null;
}

/**
 * Задание пути к директории с шаблонами
 *
 * @param {String} templatesPath
 *
 * @returns {Dbuilder}
 */
Dbuilder.prototype.setTemplatesPath = function setTemplatesPath (templatesPath)
{
    this._templatesPath = $path.normalize(templatesPath);

    return this;
};

/**
 * Задание пути к директории назначения
 *
 * @param {String} destination
 *
 * @returns {Dbuilder}
 */
Dbuilder.prototype.setDestination = function setDestination (destination)
{
    this._destination = destination;

    return this;
};

/**
 * Задание структуры директорий
 *
 * @param struct
 *
 * @returns {Dbuilder}
 */
Dbuilder.prototype.setStruct = function setStruct (struct)
{
    this._struct = struct;

    return this;
};

/**
 * Построение структуры директорий
 *
 * @returns {Dbuilder}
 */
Dbuilder.prototype.build = function build ()
{
    var self = this;

    if (!self._struct || !self._destination) return self;

    if (!fsUtil.existsSync(self._destination) || !$fs.lstatSync(self._destination).isDirectory())
        $fs.mkdirSync(self._destination);

    console.log('Была создана следующая структура каталогов:\n');
    console.log(self._destination);

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
                if (!fsUtil.existsSync(path))
                {
                    $fs.mkdirSync(path);

                    if (count === number) console.log(space + '└ ' + name);
                    else
                    {
                        if (space === '' && count === 1) console.log(space + '│');

                        console.log(space + '├ ' + name);
                    }
                }

                if (typeof objStruct.include !== 'undefined')
                    bypass(objStruct.include, path, (count < number ? space + '│ ' : space + '  '));
            }
            else if (!fsUtil.existsSync(path))
            {
                var content = '';
                if (self._templatesPath && typeof objStruct.template !== 'undefined')
                {
                    var templates = objStruct.template.split(',');

                    templates.map(function (template)
                    {
                        var pathToTemplate = $path.resolve(self._templatesPath + '/' + template);

                        if (fsUtil.existsSync(pathToTemplate) && $fs.lstatSync(pathToTemplate).isFile())
                            content += $fs.readFileSync(pathToTemplate);
                    });
                }
                else if (typeof objStruct.content !== 'undefined') content = objStruct.content;

                $fs.writeFileSync(path, content, 'UTF-8');

                if (number > count) console.log(space + '├ ' + name);
                else console.log(space + '└ ' + name);
            }

            count++;
        }
    })(self._struct, self._destination);

    return self;
};