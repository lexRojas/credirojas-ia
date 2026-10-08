import '@/components/halloween.css'

interface props {

    children: React.ReactNode;
}


export default function Halloween(props: props) {

    const children = props.children;


    return (
        <div className="stage">
            <div className="spider_1">
                <div className="eye left"></div>
                <div className="eye right"></div>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
            </div>
            <div className="spider_2">
                <div className="eye left"></div>
                <div className="eye right"></div>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
            </div>
            <div className="spider_3">
                <div className="eye left"></div>
                <div className="eye right"></div>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
            </div>
            <div className="spider_4">
                <div className="eye left"></div>
                <div className="eye right"></div>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="left leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
                <span className="right leg"></span>
            </div>


            <div>
                {children}
            </div>
            <div className="sky">
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>
                <div className="cloud"></div>

                <div className="moon"></div>
            </div>

            <div className="fence">
                <div className="fence-container">
                    <div className="cat">
                        <div className="head">
                            <div className="ears">
                                <div className="left-ear"></div>
                                <div className="right-ear"></div>
                            </div>
                            <div className="eyes">
                                <div className="left-eye"></div>
                                <div className="right-eye"></div>
                            </div>
                            <div className="whiskers">
                                <div className="left-whisker"></div>
                                <div className="right-whisker"></div>
                            </div>
                        </div>
                        <div className="body">
                            <div className="top"></div>
                            <div className="bottom"></div>
                            <div className="tail"></div>
                        </div>
                    </div>

                </div>
                <div className="posts">
                    <div className="post1"></div>
                    <div className="post2"></div>
                    <div className="post3"></div>
                    <div className="post4"></div>
                    <div className="post5"></div>
                    <div className="post6"></div>
                </div>
            </div>
            <div className="tombs">
                <div className="tomb"></div>
                <div className="tomb"></div>
                <div className="tomb"></div>
                <div className="tomb"></div>
            </div>
        </div>
    )
}