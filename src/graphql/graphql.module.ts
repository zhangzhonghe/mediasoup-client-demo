import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '@env/environment';

@NgModule({
    imports: [
        HttpClientModule,
        ApolloModule,
        HttpLinkModule,
    ],
    exports: [
        HttpClientModule,
        ApolloModule,
        HttpLinkModule,
    ],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpLink) => {
                return {
                    cache: new InMemoryCache(),
                    link: httpLink.create({
                        uri: environment.uri
                    })
                };
            },
            deps: [HttpLink]
        }
    ],
})
export class GraphqlModule {}
