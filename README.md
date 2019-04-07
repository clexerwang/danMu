
### danMU_plugin

一个小小的基于canvas的弹幕插件，目前实现了我认为最重要的功能：弹幕防挡和蒙版防遮蔽弹幕。

##### 弹幕防挡
在同一时间内弹幕不会出现在同一行，造成弹幕之间的相互遮盖；

##### 蒙版防遮蔽弹幕
在弹幕层上加上蒙版，将画面主体区域蒙版设为透明，从而使弹幕可以从画面主体区域下"穿过"，不会遮挡画面。
(由于是基于色键的所以限制比较大，只能适用于纯色背景的视频。)



此外还有一些小功能：
支持滚动与固定弹幕，彩色弹幕.

Todo:
增加弹幕大小，透明度，速度，弹幕过滤功能
改进蒙版防遮蔽弹幕，增大适用区域。
优化性能。


##### 效果预览：
![](./source/demo.gif)

