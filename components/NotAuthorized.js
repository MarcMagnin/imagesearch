import React from 'react'
import Link from 'next/link'


export default () => (
  <div>
    <h1 className="heading">You can't see this!</h1>
    <p className="content">
      You're not authenticated yet. Maybe you want to <Link href='/auth/sign-in'><a className="link">sign in</a></Link>?
    </p>
  </div>
)