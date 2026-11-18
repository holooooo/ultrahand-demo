window.TIMELINE = {
 "duration": 304.748,
 "scenes": [
  {
   "id": "hook",
   "kicker": "机制拆解 · 第 5 期",
   "title": "究极手",
   "start": 0.0,
   "voiceEnd": 31.2,
   "end": 32.1,
   "lines": [
    {
     "zh": "王国之泪里，你能把任何东西粘在一起：木板、轮子、风扇，粘出车、飞机，甚至机甲。",
     "en": "In Tears of the Kingdom you can glue anything together: planks, wheels, fans. Cars, planes, even mechs.",
     "start": 0.6,
     "end": 7.664,
     "rehook": "钩子"
    },
    {
     "zh": "可做它的程序员在 GDC 上说，开发那几年，他每天听到的就两句：坏了！飞走了！",
     "en": "But at GDC its physics programmer said the reports he got every day were just two lines: it broke! it flew away!",
     "start": 7.884,
     "end": 13.802,
     "say": "可做它的程序员在 GDC 上说，开发那几年，他每天听到的就两句：坏了！飞走了！"
    },
    {
     "zh": "所以我自己写了一个。网页里，抓起木板，转四十五度，对准，松手，粘上了。",
     "en": "So I wrote my own. In the browser: grab a plank, turn it 45 degrees, line it up, let go. Glued.",
     "start": 14.022,
     "end": 19.969
    },
    {
     "zh": "装上轮子和风扇，它自己就跑起来了。全是真实物理，没有一行“车辆程序”。",
     "en": "Add wheels and a fan and it drives off by itself. All real physics, not one line of vehicle code.",
     "start": 20.189,
     "end": 25.362,
     "rehook": "成品"
    },
    {
     "zh": "这期机制拆解，就把我做它的六步从头讲一遍：究极手，到底是怎么把东西粘住的？",
     "en": "This episode walks through the six steps I took to build it: how does Ultrahand actually stick things together?",
     "start": 25.582,
     "end": 31.2,
     "rehook": "问"
    }
   ]
  },
  {
   "id": "repo",
   "kicker": "先说福利",
   "title": "网页能玩 · 源码私信",
   "start": 32.1,
   "voiceEnd": 41.634,
   "end": 42.534,
   "lines": [
    {
     "zh": "先说福利：网页版直接就能玩，链接放在简介里。",
     "en": "First, the freebie: the web version is playable right now; the link is in the description.",
     "start": 32.1,
     "end": 35.817
    },
    {
     "zh": "完整源码我单独放了一个仓库。一键三连之后，在评论区留个言，我私信发给你。",
     "en": "The full source lives in its own repo. Like, coin and favorite, leave a comment, and I'll DM it to you.",
     "start": 36.037,
     "end": 41.634,
     "say": "完整源码我单独放了一个仓库。一键三连之后，在评论区留个言，我私信发给你。"
    }
   ]
  },
  {
   "id": "gdc",
   "kicker": "00 · 任天堂的铁律",
   "title": "一切必须是物理",
   "start": 42.534,
   "voiceEnd": 85.029,
   "end": 85.929,
   "lines": [
    {
     "zh": "任天堂没公开究极手的代码，但在 GDC 2024 上，讲了它的地基。",
     "en": "Nintendo never released Ultrahand's code, but at GDC 2024 they explained its foundation.",
     "start": 42.534,
     "end": 47.52,
     "rehook": "官方"
    },
    {
     "zh": "物理分三层：最底下是 Havok 物理中间件，上面是任天堂自己的物理库，再往上才是王国之泪专用的部分。",
     "en": "Physics comes in three layers: Havok middleware at the bottom, Nintendo's in-house physics library above it, and Tears-specific code on top.",
     "start": 47.74,
     "end": 55.105,
     "say": "物理分三层：最底下是哈沃克物理中间件，上面是任天堂自己的物理库，再往上才是王国之泪专用的部分。"
    },
    {
     "zh": "然后定了一条铁律：世界里所有东西，都必须由动力学刚体加约束构成，无一例外。",
     "en": "Then came one iron rule: everything in the world must be built from dynamic rigid bodies and constraints. No exceptions.",
     "start": 55.325,
     "end": 61.195
    },
    {
     "zh": "旧做法是按动画硬推着走的运动学物体。在物理引擎眼里，它的质量是无穷大。",
     "en": "The old way is a kinematic object pushed along by animation. To the physics engine, its mass is infinite.",
     "start": 61.415,
     "end": 66.683
    },
    {
     "zh": "早期神庙的闸门就是这样。玩家用究极手塞一块冰进去，闸门直接把冰压进地里，还在那疯狂抖。",
     "en": "Early shrine gates worked that way. Slide a block of ice under one and the gate crushes it into the floor, shaking like crazy.",
     "start": 66.903,
     "end": 73.663,
     "rehook": "翻车"
    },
    {
     "zh": "改成物理驱动以后，闸门被冰块顶住，两边留出一条缝。这条缝，反而成了一种新解法。",
     "en": "Once the gate became physics-driven, the ice holds it up and leaves a gap, and that gap became a brand-new solution.",
     "start": 73.883,
     "end": 79.975
    },
    {
     "zh": "这条铁律，就是我复刻的第一条规则：手里拿着的东西，也不能例外。",
     "en": "That iron rule is rule number one of my remake: even the thing in your hand gets no exception.",
     "start": 80.195,
     "end": 85.029
    }
   ]
  },
  {
   "id": "grab",
   "kicker": "01 · 抓",
   "title": "别改坐标，给速度",
   "start": 85.929,
   "voiceEnd": 117.645,
   "end": 118.545,
   "lines": [
    {
     "zh": "第一步，抓。从屏幕中心打一条射线，打中哪个零件，就记下打中的那个点。",
     "en": "Step one: grab. Cast a ray from the screen center and remember exactly where it hits the part.",
     "start": 85.929,
     "end": 91.382
    },
    {
     "zh": "最容易写错的是下一步：每帧直接把它的坐标改到你面前。",
     "en": "The easy mistake comes next: setting its position in front of you every frame.",
     "start": 91.602,
     "end": 95.633
    },
    {
     "zh": "这就是运动学的老路。东西直接穿墙，碰到别的零件也只会把人家挤飞。",
     "en": "That's the old kinematic road. It phases through walls and bulldozes anything in its way.",
     "start": 95.853,
     "end": 100.878,
     "rehook": "翻车"
    },
    {
     "zh": "按铁律，我不改坐标，而是每一帧算出目标位置减当前位置，乘一个系数，当成速度交给物理引擎。",
     "en": "Following the rule, I don't set positions. Each frame I take target minus current, scale it, and hand it to the engine as a velocity.",
     "start": 101.098,
     "end": 107.995
    },
    {
     "zh": "现在墙会挡住它，它也只能推开别的东西，而不是穿过去。",
     "en": "Now the wall stops it, and it can only push other things aside, never pass through them.",
     "start": 108.215,
     "end": 112.234
    },
    {
     "zh": "转身的时候，它跟着你转。因为它记的不是世界里的朝向，而是相对你的朝向。",
     "en": "When you turn, it turns with you, because it stores its orientation relative to you, not to the world.",
     "start": 112.454,
     "end": 117.645
    }
   ]
  },
  {
   "id": "rotate",
   "kicker": "02 · 转",
   "title": "四十五度一格",
   "start": 118.545,
   "voiceEnd": 129.812,
   "end": 130.712,
   "lines": [
    {
     "zh": "第二步，转。每按一下转四十五度，转完再吸附到最近的网格角度。",
     "en": "Step two: rotate. Each press turns it 45 degrees, then snaps it to the nearest grid angle.",
     "start": 118.545,
     "end": 123.3
    },
    {
     "zh": "这样木板才摆得正、对得齐。游戏里具体怎么吸附，任天堂没讲，四十五度是我自己选的。",
     "en": "That's what keeps planks square and aligned. Nintendo never said how the game snaps; 45 degrees is my own choice.",
     "start": 123.52,
     "end": 129.812
    }
   ]
  },
  {
   "id": "find",
   "kicker": "03 · 找点",
   "title": "最近的两个点",
   "start": 130.712,
   "voiceEnd": 155.789,
   "end": 156.689,
   "lines": [
    {
     "zh": "第三步，找粘接点。举着的时候，每一帧都在问：我这坨零件，离别的零件最近的是哪两个点？",
     "en": "Step three: find the glue point. While you hold something, every frame asks: which two points are closest between my parts and everyone else's?",
     "start": 130.712,
     "end": 137.448
    },
    {
     "zh": "物理引擎正好有这个查询：给两个形状，返回最近的两点和距离。",
     "en": "The physics engine already has that query: give it two shapes, get back the two closest points and the distance.",
     "start": 137.668,
     "end": 142.012
    },
    {
     "zh": "距离小于一个阈值，就画出这根预览线。换个角度，最近点就跟着跳。",
     "en": "If the distance is under a threshold, draw this preview line. Change the angle and the closest pair jumps with it.",
     "start": 142.232,
     "end": 147.08,
     "rehook": "看"
    },
    {
     "zh": "据媒体报道，任天堂还申请过一项专利：粘的时候，在两个物体上同时显示吸附点。你只动一个，两边都告诉你会粘在哪。",
     "en": "Nintendo reportedly even filed a patent on this: show the snap points on both objects at once. You move one, and both tell you where they'll join.",
     "start": 147.3,
     "end": 155.789
    }
   ]
  },
  {
   "id": "glue",
   "kicker": "04 · 粘",
   "title": "关节，还是合体？",
   "start": 156.689,
   "voiceEnd": 198.526,
   "end": 199.426,
   "lines": [
    {
     "zh": "第四步，粘。松手那一刻，先把整坨东西平移那一小段距离，让两点贴上，再把它们连起来。",
     "en": "Step four: glue. The moment you let go, slide the whole thing that last little gap until the two points touch, then connect them.",
     "start": 156.689,
     "end": 163.489
    },
    {
     "zh": "怎么连，有两种做法。第一种叫关节：两块还是两个刚体，中间加一个固定关节，每帧把它们拉回原来的相对位置。",
     "en": "There are two ways to connect. One is a joint: they stay two rigid bodies, and a fixed joint pulls them back to their relative pose every frame.",
     "start": 163.709,
     "end": 171.659
    },
    {
     "zh": "第二种叫合并：把两块的碰撞体挂到同一个刚体上，从此它们就是一个物体。",
     "en": "The other is merging: hang both colliders on one rigid body, and from then on they are a single object.",
     "start": 171.879,
     "end": 177.129
    },
    {
     "zh": "用一座木板桥试试，砸一块巨石。关节版会弯、会晃；合并版铁板一块。",
     "en": "Let's test it on a plank bridge and drop a boulder. The joint version bends and sways; the merged one stays rigid as a slab.",
     "start": 177.349,
     "end": 182.695,
     "rehook": "对比"
    },
    {
     "zh": "那游戏里是哪一种？任天堂没说，只说过一切都是刚体加约束。粘出来的车会晃、会被扯开，更像关节，但这只是我的推测。",
     "en": "So which one does the game use? Nintendo never said; only that everything is rigid bodies plus constraints. Builds that wobble and pull apart look like joints, but that's my guess.",
     "start": 182.915,
     "end": 192.462
    },
    {
     "zh": "关节版还有个细节必须处理：粘在一起的零件之间要关掉碰撞，不然它们会互相顶着打架。",
     "en": "The joint version needs one more detail: turn off collisions between glued parts, or they fight each other forever.",
     "start": 192.682,
     "end": 198.526
    }
   ]
  },
  {
   "id": "carry",
   "kicker": "05 · 整坨搬",
   "title": "一起动，别硬拽",
   "start": 199.426,
   "voiceEnd": 229.418,
   "end": 230.318,
   "lines": [
    {
     "zh": "第五步，粘完再抓，你抓的就是一整坨。",
     "en": "Step five: once things are glued, grabbing one grabs the whole assembly.",
     "start": 199.426,
     "end": 202.381
    },
    {
     "zh": "如果只拽被抓的那一块，其他零件全靠关节被拖着走。东西一长，就软塌塌的，一甩就乱。",
     "en": "If you only drag the piece you grabbed, every other part gets dragged by joints. Make it long and it goes limp and flails.",
     "start": 202.601,
     "end": 209.14,
     "rehook": "翻车"
    },
    {
     "zh": "所以要让每个零件都按同一个刚体变换去追目标。整坨一起动，关节几乎不用出力。",
     "en": "So every part chases the target with the same rigid transform. The whole thing moves as one and the joints barely have to work.",
     "start": 209.36,
     "end": 215.278
    },
    {
     "zh": "还有上限。玩家实测，一次最多粘二十一个零件，原因任天堂没解释。",
     "en": "And there's a cap: players found you can glue at most 21 parts at once. Nintendo never explained why.",
     "start": 215.498,
     "end": 220.463
    },
    {
     "zh": "但零件越多，物理引擎要同时解的约束就越多。我把求解器迭代次数调到一，同一根长杆就成了面条；调到八，它才站得直。",
     "en": "But more parts means more constraints to solve at once. Set solver iterations to one and the same long pole turns into a noodle; at eight it stands straight.",
     "start": 220.683,
     "end": 229.418
    }
   ]
  },
  {
   "id": "power",
   "kicker": "06 · 动力",
   "title": "没有车辆程序",
   "start": 230.318,
   "voiceEnd": 263.385,
   "end": 264.285,
   "lines": [
    {
     "zh": "第六步，动力。风扇最简单：每一帧，在它所在的位置，沿它朝的方向，施加一个推力。",
     "en": "Step six: power. A fan is the easy one: every frame, push with a force at its position, along the way it faces.",
     "start": 230.318,
     "end": 236.873
    },
    {
     "zh": "轮子不一样，它得能转。所以不能合并，也不能用固定关节，只能用转动关节，再加一个马达拧它。",
     "en": "Wheels are different: they have to spin. So no merging and no fixed joint, only a hinge joint with a motor twisting it.",
     "start": 237.093,
     "end": 244.06
    },
    {
     "zh": "GDC 上讲过，游戏里一个轮子由三个刚体组成：车轮、马达和轴，还带悬挂。",
     "en": "At GDC they said a single wheel in the game is three rigid bodies: the wheel, a motor and a shaft, with suspension.",
     "start": 244.28,
     "end": 250.393
    },
    {
     "zh": "这才是王国之泪最狠的地方：根本没有车辆程序。车，只是轮子、木板、风扇，各自按物理规则凑在一起。",
     "en": "That's the boldest part of Tears of the Kingdom: there is no vehicle code at all. A car is just wheels, planks and fans, each following physics.",
     "start": 250.613,
     "end": 258.357,
     "rehook": "官方"
    },
    {
     "zh": "用开发者的话说：我们做的不是有趣的东西，而是让有趣的事情发生的系统。",
     "en": "In the developers' words: rather than make something fun, make a system where fun things happen.",
     "start": 258.577,
     "end": 263.385
    }
   ]
  },
  {
   "id": "besiege",
   "kicker": "07 · 对比围攻",
   "title": "会散架的机器",
   "start": 264.285,
   "voiceEnd": 290.85,
   "end": 291.75,
   "lines": [
    {
     "zh": "说到拼机器，绕不开围攻。它是先造后跑：搭的时候方块只是摆着，按下开始，才连上关节，开始物理。",
     "en": "Talking about machine building, you can't skip Besiege. You build first and run later: blocks just sit there until you press start, then joints connect and physics begins.",
     "start": 264.285,
     "end": 272.467,
     "say": "说到拼机器，绕不开围攻。它是先造后跑：搭的时候方块只是摆着，按下开始，才连上关节，开始物理。"
    },
    {
     "zh": "而且关节有受力上限，超了就断。机器散架，本身就是玩法。",
     "en": "And joints have a strength limit; exceed it and they snap. Machines falling apart is the gameplay.",
     "start": 272.687,
     "end": 277.149,
     "rehook": "翻车"
    },
    {
     "zh": "我也做了一个围攻模式：每帧估算关节被拉开了多远，连续超载几帧，就断开。",
     "en": "I added a Besiege mode too: every frame, estimate how far each joint is being pulled apart, and if it stays overloaded for a few frames, it breaks.",
     "start": 277.369,
     "end": 282.928
    },
    {
     "zh": "两种设计，目标不同。围攻要你造一个扛得住的结构；王国之泪要你在活的世界里随手乱粘，而世界不能崩。",
     "en": "Two designs, two goals. Besiege wants you to engineer a structure that holds; Tears wants you to glue freely in a living world that must never break.",
     "start": 283.148,
     "end": 290.85
    }
   ]
  },
  {
   "id": "outro",
   "kicker": "机制拆解 · 第 5 期",
   "title": "去粘点什么",
   "start": 291.75,
   "voiceEnd": 301.748,
   "end": 304.748,
   "lines": [
    {
     "zh": "网页版链接在简介，打开就能玩。想要源码，三连加评论，我私信发你。",
     "en": "The web version is linked in the description. Want the source? Like, coin, favorite, comment, and I'll DM it to you.",
     "start": 291.75,
     "end": 297.251
    },
    {
     "zh": "我是粑粑柑，机制拆解，每期拆一个游戏机制。我们下期见。",
     "en": "I'm Babagan. Mechanics Breakdown takes apart one game mechanic per episode. See you next time.",
     "start": 297.471,
     "end": 301.748,
     "say": "我是粑粑柑，机制拆解，每期拆一个游戏机制。我们下期见。"
    }
   ]
  }
 ],
 "subs": [
  {
   "zh": "王国之泪里，你能把任何东西粘在一起：",
   "en": "In Tears of the Kingdom you can glue anything together:",
   "start": 0.6,
   "end": 4.037
  },
  {
   "zh": "木板、轮子、风扇，粘出车、飞机",
   "en": "planks, wheels, fans. Cars, planes,",
   "start": 4.037,
   "end": 6.901
  },
  {
   "zh": "甚至机甲",
   "en": "even mechs.",
   "start": 6.901,
   "end": 7.664
  },
  {
   "zh": "可做它的程序员在 GDC 上说",
   "en": "But at GDC its physics programmer said the",
   "start": 7.884,
   "end": 10.22
  },
  {
   "zh": "开发那几年，他每天听到的就两句：",
   "en": "reports he got every day were just two lines:",
   "start": 10.22,
   "end": 12.712
  },
  {
   "zh": "坏了！飞走了！",
   "en": "it broke! it flew away!",
   "start": 12.712,
   "end": 13.802
  },
  {
   "zh": "所以我自己写了一个。网页里",
   "en": "So I wrote my own. In the browser:",
   "start": 14.022,
   "end": 16.438
  },
  {
   "zh": "抓起木板，转四十五度，对准，松手",
   "en": "grab a plank, turn it 45 degrees, line it up, let go.",
   "start": 16.438,
   "end": 19.411
  },
  {
   "zh": "粘上了",
   "en": "Glued.",
   "start": 19.411,
   "end": 19.969
  },
  {
   "zh": "装上轮子和风扇，它自己就跑起来了",
   "en": "Add wheels and a fan and it drives off by itself.",
   "start": 20.189,
   "end": 22.697
  },
  {
   "zh": "全是真实物理，没有一行“车辆程序”",
   "en": "All real physics, not one line of vehicle code.",
   "start": 22.697,
   "end": 25.362
  },
  {
   "zh": "这期机制拆解",
   "en": "This episode walks",
   "start": 25.582,
   "end": 26.545
  },
  {
   "zh": "就把我做它的六步从头讲一遍：究极手",
   "en": "through the six steps I took to build it: how does",
   "start": 26.545,
   "end": 29.273
  },
  {
   "zh": "到底是怎么把东西粘住的？",
   "en": "Ultrahand actually stick things together?",
   "start": 29.273,
   "end": 31.2
  },
  {
   "zh": "先说福利：网页版直接就能玩",
   "en": "First, the freebie: the web version is playable right now;",
   "start": 32.1,
   "end": 34.516
  },
  {
   "zh": "链接放在简介里",
   "en": "the link is in the description.",
   "start": 34.516,
   "end": 35.817
  },
  {
   "zh": "完整源码我单独放了一个仓库",
   "en": "The full source lives in its own repo.",
   "start": 36.037,
   "end": 38.242
  },
  {
   "zh": "一键三连之后，在评论区留个言",
   "en": "Like, coin and favorite, leave a comment,",
   "start": 38.242,
   "end": 40.617
  },
  {
   "zh": "我私信发给你",
   "en": "and I'll DM it to you.",
   "start": 40.617,
   "end": 41.634
  },
  {
   "zh": "任天堂没公开究极手的代码",
   "en": "Nintendo never released Ultrahand's code,",
   "start": 42.534,
   "end": 44.404
  },
  {
   "zh": "但在 GDC 2024 上，讲了它的地基",
   "en": "but at GDC 2024 they explained its foundation.",
   "start": 44.404,
   "end": 47.52
  },
  {
   "zh": "物理分三层：",
   "en": "Physics comes in",
   "start": 47.74,
   "end": 48.66
  },
  {
   "zh": "最底下是 Havok 物理中间件",
   "en": "three layers: Havok middleware at the bottom,",
   "start": 48.66,
   "end": 51.115
  },
  {
   "zh": "上面是任天堂自己的物理库",
   "en": "Nintendo's in-house physics library",
   "start": 51.115,
   "end": 52.957
  },
  {
   "zh": "再往上才是王国之泪专用的部分",
   "en": "above it, and Tears-specific code on top.",
   "start": 52.957,
   "end": 55.105
  },
  {
   "zh": "然后定了一条铁律：世界里所有东西",
   "en": "Then came one iron rule: everything in the world must be",
   "start": 55.325,
   "end": 58.087
  },
  {
   "zh": "都必须由动力学刚体加约束构成",
   "en": "built from dynamic rigid bodies and constraints.",
   "start": 58.087,
   "end": 60.504
  },
  {
   "zh": "无一例外",
   "en": "No exceptions.",
   "start": 60.504,
   "end": 61.195
  },
  {
   "zh": "旧做法是按动画硬推着走的运动学物体",
   "en": "The old way is a kinematic object pushed along by animation.",
   "start": 61.415,
   "end": 64.129
  },
  {
   "zh": "在物理引擎眼里，它的质量是无穷大",
   "en": "To the physics engine, its mass is infinite.",
   "start": 64.129,
   "end": 66.683
  },
  {
   "zh": "早期神庙的闸门就是这样",
   "en": "Early shrine gates worked that way.",
   "start": 66.903,
   "end": 68.762
  },
  {
   "zh": "玩家用究极手塞一块冰进去",
   "en": "Slide a block of ice under one and the",
   "start": 68.762,
   "end": 70.79
  },
  {
   "zh": "闸门直接把冰压进地里，还在那疯狂抖",
   "en": "gate crushes it into the floor, shaking like crazy.",
   "start": 70.79,
   "end": 73.663
  },
  {
   "zh": "改成物理驱动以后，闸门被冰块顶住",
   "en": "Once the gate became physics-driven, the ice holds",
   "start": 73.883,
   "end": 76.591
  },
  {
   "zh": "两边留出一条缝。这条缝",
   "en": "it up and leaves a gap, and that gap",
   "start": 76.591,
   "end": 78.452
  },
  {
   "zh": "反而成了一种新解法",
   "en": "became a brand-new solution.",
   "start": 78.452,
   "end": 79.975
  },
  {
   "zh": "这条铁律，就是我复刻的第一条规则：",
   "en": "That iron rule is rule number one of my remake:",
   "start": 80.195,
   "end": 82.934
  },
  {
   "zh": "手里拿着的东西，也不能例外",
   "en": "even the thing in your hand gets no exception.",
   "start": 82.934,
   "end": 85.029
  },
  {
   "zh": "第一步，抓。从屏幕中心打一条射线",
   "en": "Step one: grab. Cast a ray from the screen center",
   "start": 85.929,
   "end": 88.655
  },
  {
   "zh": "打中哪个零件，就记下打中的那个点",
   "en": "and remember exactly where it hits the part.",
   "start": 88.655,
   "end": 91.382
  },
  {
   "zh": "最容易写错的是下一步：",
   "en": "The easy mistake comes next:",
   "start": 91.602,
   "end": 93.376
  },
  {
   "zh": "每帧直接把它的坐标改到你面前",
   "en": "setting its position in front of you every frame.",
   "start": 93.376,
   "end": 95.633
  },
  {
   "zh": "这就是运动学的老路。东西直接穿墙",
   "en": "That's the old kinematic road. It phases through",
   "start": 95.853,
   "end": 98.533
  },
  {
   "zh": "碰到别的零件也只会把人家挤飞",
   "en": "walls and bulldozes anything in its way.",
   "start": 98.533,
   "end": 100.878
  },
  {
   "zh": "按铁律，我不改坐标",
   "en": "Following the rule, I don't",
   "start": 101.098,
   "end": 102.612
  },
  {
   "zh": "而是每一帧算出目标位置减当前位置",
   "en": "set positions. Each frame I take target minus current,",
   "start": 102.612,
   "end": 105.303
  },
  {
   "zh": "乘一个系数，当成速度交给物理引擎",
   "en": "scale it, and hand it to the engine as a velocity.",
   "start": 105.303,
   "end": 107.995
  },
  {
   "zh": "现在墙会挡住它",
   "en": "Now the wall stops it,",
   "start": 108.215,
   "end": 109.387
  },
  {
   "zh": "它也只能推开别的东西，而不是穿过去",
   "en": "and it can only push other things aside, never pass through them.",
   "start": 109.387,
   "end": 112.234
  },
  {
   "zh": "转身的时候，它跟着你转",
   "en": "When you turn, it turns with you,",
   "start": 112.454,
   "end": 114.239
  },
  {
   "zh": "因为它记的不是世界里的朝向",
   "en": "because it stores its orientation relative",
   "start": 114.239,
   "end": 116.348
  },
  {
   "zh": "而是相对你的朝向",
   "en": "to you, not to the world.",
   "start": 116.348,
   "end": 117.645
  },
  {
   "zh": "第二步，转。每按一下转四十五度",
   "en": "Step two: rotate. Each press turns it 45 degrees,",
   "start": 118.545,
   "end": 121.093
  },
  {
   "zh": "转完再吸附到最近的网格角度",
   "en": "then snaps it to the nearest grid angle.",
   "start": 121.093,
   "end": 123.3
  },
  {
   "zh": "这样木板才摆得正、对得齐",
   "en": "That's what keeps planks square and",
   "start": 123.52,
   "end": 125.561
  },
  {
   "zh": "游戏里具体怎么吸附，任天堂没讲",
   "en": "aligned. Nintendo never said how the game snaps;",
   "start": 125.561,
   "end": 128.112
  },
  {
   "zh": "四十五度是我自己选的",
   "en": "45 degrees is my own choice.",
   "start": 128.112,
   "end": 129.812
  },
  {
   "zh": "第三步，找粘接点。举着的时候",
   "en": "Step three: find the glue point. While you hold something,",
   "start": 130.712,
   "end": 133.07
  },
  {
   "zh": "每一帧都在问：我这坨零件",
   "en": "every frame asks: which two points",
   "start": 133.07,
   "end": 135.09
  },
  {
   "zh": "离别的零件最近的是哪两个点？",
   "en": "are closest between my parts and everyone else's?",
   "start": 135.09,
   "end": 137.448
  },
  {
   "zh": "物理引擎正好有这个查询：给两个形状",
   "en": "The physics engine already has that query: give it two shapes, get back",
   "start": 137.668,
   "end": 140.403
  },
  {
   "zh": "返回最近的两点和距离",
   "en": "the two closest points and the distance.",
   "start": 140.403,
   "end": 142.012
  },
  {
   "zh": "距离小于一个阈值，就画出这根预览线",
   "en": "If the distance is under a threshold, draw this preview line.",
   "start": 142.232,
   "end": 145.074
  },
  {
   "zh": "换个角度，最近点就跟着跳",
   "en": "Change the angle and the closest pair jumps with it.",
   "start": 145.074,
   "end": 147.08
  },
  {
   "zh": "据媒体报道，任天堂还申请过一项专利：",
   "en": "Nintendo reportedly even filed a patent on this:",
   "start": 147.3,
   "end": 150.296
  },
  {
   "zh": "粘的时候",
   "en": "show the snap",
   "start": 150.296,
   "end": 150.962
  },
  {
   "zh": "在两个物体上同时显示吸附点",
   "en": "points on both objects at once.",
   "start": 150.962,
   "end": 153.126
  },
  {
   "zh": "你只动一个，两边都告诉你会粘在哪",
   "en": "You move one, and both tell you where they'll join.",
   "start": 153.126,
   "end": 155.789
  },
  {
   "zh": "第四步，粘。松手那一刻",
   "en": "Step four: glue. The moment you let go,",
   "start": 156.689,
   "end": 158.657
  },
  {
   "zh": "先把整坨东西平移那一小段距离",
   "en": "slide the whole thing that last little gap",
   "start": 158.657,
   "end": 161.162
  },
  {
   "zh": "让两点贴上，再把它们连起来",
   "en": "until the two points touch, then connect them.",
   "start": 161.162,
   "end": 163.489
  },
  {
   "zh": "怎么连，有两种做法。第一种叫关节：",
   "en": "There are two ways to connect. One is a joint:",
   "start": 163.709,
   "end": 166.525
  },
  {
   "zh": "两块还是两个刚体",
   "en": "they stay two rigid bodies,",
   "start": 166.525,
   "end": 167.85
  },
  {
   "zh": "中间加一个固定关节",
   "en": "and a fixed joint pulls them",
   "start": 167.85,
   "end": 169.34
  },
  {
   "zh": "每帧把它们拉回原来的相对位置",
   "en": "back to their relative pose every frame.",
   "start": 169.34,
   "end": 171.659
  },
  {
   "zh": "第二种叫合并：",
   "en": "The other is merging:",
   "start": 171.879,
   "end": 173.028
  },
  {
   "zh": "把两块的碰撞体挂到同一个刚体上",
   "en": "hang both colliders on one rigid body, and from",
   "start": 173.028,
   "end": 175.489
  },
  {
   "zh": "从此它们就是一个物体",
   "en": "then on they are a single object.",
   "start": 175.489,
   "end": 177.129
  },
  {
   "zh": "用一座木板桥试试，砸一块巨石",
   "en": "Let's test it on a plank bridge and drop a boulder.",
   "start": 177.349,
   "end": 179.844
  },
  {
   "zh": "关节版会弯、会晃；合并版铁板一块",
   "en": "The joint version bends and sways; the merged one stays rigid as a slab.",
   "start": 179.844,
   "end": 182.695
  },
  {
   "zh": "那游戏里是哪一种？任天堂没说",
   "en": "So which one does the game use? Nintendo never said;",
   "start": 182.915,
   "end": 185.536
  },
  {
   "zh": "只说过一切都是刚体加约束",
   "en": "only that everything is rigid bodies",
   "start": 185.536,
   "end": 187.782
  },
  {
   "zh": "粘出来的车会晃、会被扯开，更像关节",
   "en": "plus constraints. Builds that wobble and pull apart look like joints,",
   "start": 187.782,
   "end": 190.965
  },
  {
   "zh": "但这只是我的推测",
   "en": "but that's my guess.",
   "start": 190.965,
   "end": 192.462
  },
  {
   "zh": "关节版还有个细节必须处理：",
   "en": "The joint version needs one more detail:",
   "start": 192.682,
   "end": 194.681
  },
  {
   "zh": "粘在一起的零件之间要关掉碰撞",
   "en": "turn off collisions between glued parts,",
   "start": 194.681,
   "end": 196.834
  },
  {
   "zh": "不然它们会互相顶着打架",
   "en": "or they fight each other forever.",
   "start": 196.834,
   "end": 198.526
  },
  {
   "zh": "第五步，粘完再抓，你抓的就是一整坨",
   "en": "Step five: once things are glued, grabbing one grabs the whole assembly.",
   "start": 199.426,
   "end": 202.381
  },
  {
   "zh": "如果只拽被抓的那一块",
   "en": "If you only drag the piece you grabbed,",
   "start": 202.601,
   "end": 204.369
  },
  {
   "zh": "其他零件全靠关节被拖着走。东西一长",
   "en": "every other part gets dragged by joints. Make it",
   "start": 204.369,
   "end": 207.373
  },
  {
   "zh": "就软塌塌的，一甩就乱",
   "en": "long and it goes limp and flails.",
   "start": 207.373,
   "end": 209.14
  },
  {
   "zh": "所以要让每个零件都按同一个刚体变换去追目标",
   "en": "So every part chases the target with the same rigid transform. The whole thing",
   "start": 209.36,
   "end": 212.911
  },
  {
   "zh": "整坨一起动，关节几乎不用出力",
   "en": "moves as one and the joints barely have to work.",
   "start": 212.911,
   "end": 215.278
  },
  {
   "zh": "还有上限。玩家实测",
   "en": "And there's a cap: players found",
   "start": 215.498,
   "end": 217.094
  },
  {
   "zh": "一次最多粘二十一个零件",
   "en": "you can glue at most 21 parts at once.",
   "start": 217.094,
   "end": 219.045
  },
  {
   "zh": "原因任天堂没解释",
   "en": "Nintendo never explained why.",
   "start": 219.045,
   "end": 220.463
  },
  {
   "zh": "但零件越多",
   "en": "But more parts",
   "start": 220.683,
   "end": 221.557
  },
  {
   "zh": "物理引擎要同时解的约束就越多",
   "en": "means more constraints to solve at once.",
   "start": 221.557,
   "end": 224.003
  },
  {
   "zh": "我把求解器迭代次数调到一",
   "en": "Set solver iterations to one and the same",
   "start": 224.003,
   "end": 226.099
  },
  {
   "zh": "同一根长杆就成了面条；调到八",
   "en": "long pole turns into a noodle; at eight it",
   "start": 226.099,
   "end": 228.544
  },
  {
   "zh": "它才站得直",
   "en": "stands straight.",
   "start": 228.544,
   "end": 229.418
  },
  {
   "zh": "第六步，动力。风扇最简单：每一帧",
   "en": "Step six: power. A fan is the easy one: every frame,",
   "start": 230.318,
   "end": 233.231
  },
  {
   "zh": "在它所在的位置，沿它朝的方向",
   "en": "push with a force at its position,",
   "start": 233.231,
   "end": 235.781
  },
  {
   "zh": "施加一个推力",
   "en": "along the way it faces.",
   "start": 235.781,
   "end": 236.873
  },
  {
   "zh": "轮子不一样，它得能转。所以不能合并",
   "en": "Wheels are different: they have to spin.",
   "start": 237.093,
   "end": 239.982
  },
  {
   "zh": "也不能用固定关节，只能用转动关节",
   "en": "So no merging and no fixed joint, only a hinge joint with",
   "start": 239.982,
   "end": 242.7
  },
  {
   "zh": "再加一个马达拧它",
   "en": "a motor twisting it.",
   "start": 242.7,
   "end": 244.06
  },
  {
   "zh": "GDC 上讲过",
   "en": "At GDC they said a single",
   "start": 244.28,
   "end": 245.577
  },
  {
   "zh": "游戏里一个轮子由三个刚体组成：车轮",
   "en": "wheel in the game is three rigid bodies: the wheel,",
   "start": 245.577,
   "end": 248.726
  },
  {
   "zh": "马达和轴，还带悬挂",
   "en": "a motor and a shaft, with suspension.",
   "start": 248.726,
   "end": 250.393
  },
  {
   "zh": "这才是王国之泪最狠的地方：",
   "en": "That's the boldest part of Tears of the Kingdom:",
   "start": 250.613,
   "end": 252.85
  },
  {
   "zh": "根本没有车辆程序。车，只是轮子",
   "en": "there is no vehicle code at all. A car is",
   "start": 252.85,
   "end": 255.432
  },
  {
   "zh": "木板、风扇，各自按物理规则凑在一起",
   "en": "just wheels, planks and fans, each following physics.",
   "start": 255.432,
   "end": 258.357
  },
  {
   "zh": "用开发者的话说：",
   "en": "In the developers' words:",
   "start": 258.577,
   "end": 259.779
  },
  {
   "zh": "我们做的不是有趣的东西",
   "en": "rather than make something fun,",
   "start": 259.779,
   "end": 261.432
  },
  {
   "zh": "而是让有趣的事情发生的系统",
   "en": "make a system where fun things happen.",
   "start": 261.432,
   "end": 263.385
  },
  {
   "zh": "说到拼机器，绕不开围攻",
   "en": "Talking about machine building, you can't",
   "start": 264.285,
   "end": 266.379
  },
  {
   "zh": "它是先造后跑：搭的时候方块只是摆着",
   "en": "skip Besiege. You build first and run later: blocks just sit there",
   "start": 266.379,
   "end": 269.613
  },
  {
   "zh": "按下开始，才连上关节，开始物理",
   "en": "until you press start, then joints connect and physics begins.",
   "start": 269.613,
   "end": 272.467
  },
  {
   "zh": "而且关节有受力上限，超了就断",
   "en": "And joints have a strength limit; exceed it and they snap.",
   "start": 272.687,
   "end": 275.186
  },
  {
   "zh": "机器散架，本身就是玩法",
   "en": "Machines falling apart is the gameplay.",
   "start": 275.186,
   "end": 277.149
  },
  {
   "zh": "我也做了一个围攻模式：",
   "en": "I added a Besiege mode too: every frame, estimate",
   "start": 277.369,
   "end": 279.222
  },
  {
   "zh": "每帧估算关节被拉开了多远",
   "en": "how far each joint is being pulled apart, and if it",
   "start": 279.222,
   "end": 281.244
  },
  {
   "zh": "连续超载几帧，就断开",
   "en": "stays overloaded for a few frames, it breaks.",
   "start": 281.244,
   "end": 282.928
  },
  {
   "zh": "两种设计，目标不同",
   "en": "Two designs, two goals.",
   "start": 283.148,
   "end": 284.724
  },
  {
   "zh": "围攻要你造一个扛得住的结构",
   "en": "Besiege wants you to engineer a structure that holds;",
   "start": 284.724,
   "end": 286.999
  },
  {
   "zh": "王国之泪要你在活的世界里随手乱粘",
   "en": "Tears wants you to glue freely in a living world that",
   "start": 286.999,
   "end": 289.8
  },
  {
   "zh": "而世界不能崩",
   "en": "must never break.",
   "start": 289.8,
   "end": 290.85
  },
  {
   "zh": "网页版链接在简介，打开就能玩",
   "en": "The web version is linked in the description. Want the",
   "start": 291.75,
   "end": 294.317
  },
  {
   "zh": "想要源码，三连加评论，我私信发你",
   "en": "source? Like, coin, favorite, comment, and I'll DM it to you.",
   "start": 294.317,
   "end": 297.251
  },
  {
   "zh": "我是粑粑柑，机制拆解",
   "en": "I'm Babagan. Mechanics Breakdown takes",
   "start": 297.471,
   "end": 299.182
  },
  {
   "zh": "每期拆一个游戏机制。我们下期见",
   "en": "apart one game mechanic per episode. See you next time.",
   "start": 299.182,
   "end": 301.748
  }
 ]
};
