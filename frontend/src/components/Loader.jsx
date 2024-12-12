import React from 'react'

const Loader = () => {
    const ballColors = [
        'bg-gray-500',
        'bg-gray-300',
        'bg-gray-500',
        'bg-gray-300',
        'bg-gray-500'
    ];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center">
            <div className="backdrop-blur-md p-8 rounded-xl flex flex-col items-center">
                <div className="grid grid-cols-5 gap-2.5 justify-center items-center mb-4">
                    {ballColors.map((color, index) => (
                        <div
                            key={index}
                            className={`w-5 h-5 rounded-full ${color} animate-bounce`}
                            style={{
                                animationDelay: `${-0.2 * index}s`
                            }}
                        />
                    ))}
                </div>
                <p className="text-gray-700 text-lg font-medium tracking-wider">Loading..</p>
            </div>
        </div>
    );
};
export default Loader